"""
F1 Race Engineer AI - Main FastAPI Gateway
Real-time WebSocket gateway for telemetry and radio data
"""

import asyncio
import json
import logging
import os
from datetime import datetime
from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uvicorn

from services.kafka_consumer import KafkaConsumer
from services.anomaly_detector import AnomalyDetector
from services.radio_transcriber import RadioTranscriber
from services.driver_summarizer import DriverSummarizer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import google.generativeai for Gemini
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google.generativeai not installed. AI chat will use fallback responses.")

app = FastAPI(
    title="F1 Race Engineer AI",
    description="Real-time F1 telemetry and radio analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.driver_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, driver_id: Optional[str] = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if driver_id:
            if driver_id not in self.driver_connections:
                self.driver_connections[driver_id] = []
            self.driver_connections[driver_id].append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, driver_id: Optional[str] = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if driver_id and driver_id in self.driver_connections:
            if websocket in self.driver_connections[driver_id]:
                self.driver_connections[driver_id].remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending message: {e}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")

    async def broadcast_to_driver(self, message: str, driver_id: str):
        if driver_id in self.driver_connections:
            for connection in self.driver_connections[driver_id]:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.error(f"Error sending to driver {driver_id}: {e}")

manager = ConnectionManager()

# Initialize services
kafka_consumer = KafkaConsumer()
anomaly_detector = AnomalyDetector()
radio_transcriber = RadioTranscriber()
driver_summarizer = DriverSummarizer()

# Initialize Gemini if available
if GEMINI_AVAILABLE:
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if gemini_api_key:
        genai.configure(api_key=gemini_api_key)
        gemini_model = genai.GenerativeModel('gemini-pro')
        logger.info("Gemini AI initialized successfully")
    else:
        GEMINI_AVAILABLE = False
        logger.warning("GEMINI_API_KEY not found in environment")

# Pydantic models
class TelemetryData(BaseModel):
    ts: str
    driver_id: str
    lap: int
    distance_m: float
    sector: int
    track_x: float
    speed_kph: float
    throttle_pct: float
    brake_pct: float
    gear: int

class RadioTranscript(BaseModel):
    ts: str
    team: str
    driver_id: str
    text: str

class AnomalyEvent(BaseModel):
    ts: str
    driver_id: str
    feature: str
    score: float
    value: float
    baseline: float

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.get("/")
async def root():
    return {"message": "F1 Race Engineer AI Gateway", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Chat endpoint for voice assistant using Gemini AI
    """
    try:
        if GEMINI_AVAILABLE:
            # Use Gemini to generate response
            prompt = f"""You are an F1 race engineer AI assistant. You help with race strategy,
            telemetry analysis, and provide tactical advice. Be concise and professional.

            User message: {request.message}

            Provide a helpful and concise response (max 2-3 sentences):"""

            response = gemini_model.generate_content(prompt)
            return ChatResponse(response=response.text)
        else:
            # Fallback responses when Gemini is not available
            message_lower = request.message.lower()

            if any(word in message_lower for word in ['fuel', 'refuel', 'gas']):
                return ChatResponse(
                    response="Current fuel levels are being monitored. Consider a pit stop if fuel drops below 15%."
                )
            elif any(word in message_lower for word in ['tire', 'tyre', 'pit']):
                return ChatResponse(
                    response="Tire degradation is within normal parameters. Recommended pit window is laps 18-22."
                )
            elif any(word in message_lower for word in ['speed', 'fast', 'pace']):
                return ChatResponse(
                    response="Current pace is competitive. Focus on maintaining consistent lap times and managing tire wear."
                )
            elif any(word in message_lower for word in ['position', 'overtake', 'pass']):
                return ChatResponse(
                    response="Monitor gap to car ahead. DRS available on main straight. Consider strategic positioning."
                )
            else:
                return ChatResponse(
                    response="I'm here to help with race strategy and analysis. What aspect would you like to discuss?"
                )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Error processing chat request")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "subscribe_driver":
                driver_id = message.get("driver_id")
                if driver_id:
                    await manager.connect(websocket, driver_id)
                    await websocket.send_text(json.dumps({
                        "type": "subscribed",
                        "driver_id": driver_id
                    }))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/{driver_id}")
async def websocket_driver_endpoint(websocket: WebSocket, driver_id: str):
    await manager.connect(websocket, driver_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle driver-specific messages
    except WebSocketDisconnect:
        manager.disconnect(websocket, driver_id)

# Driver state tracking for consistent lap progression
driver_states = {}

def init_driver_state(driver_id):
    """Initialize driver state with lap progression"""
    return {
        "driver_id": driver_id,
        "lap": 1,
        "track_position": 0.0,  # 0.0 to 1.0 representing full lap
        "sector": 1,
        "distance_m": 0.0,
        "speed_kph": 200.0,
        "last_update": datetime.now()
    }

def update_driver_position(driver_id, delta_time):
    """Update driver position with consistent forward progression"""
    import random

    if driver_id not in driver_states:
        driver_states[driver_id] = init_driver_state(driver_id)

    state = driver_states[driver_id]

    # Base speed with some variation
    base_speed = 250 + random.uniform(-50, 50)

    # Calculate distance traveled (speed in km/h converted to m/s, then multiplied by time)
    distance_increment = (base_speed * 1000 / 3600) * delta_time  # meters

    # Track is approximately 30000m long (balanced for visible progression)
    track_length = 30000.0
    state["distance_m"] += distance_increment
    state["speed_kph"] = base_speed

    # Calculate current lap (starting from lap 1)
    state["lap"] = int(state["distance_m"] / track_length) + 1

    # Calculate track position within current lap (0.0 to 1.0)
    state["track_position"] = (state["distance_m"] % track_length) / track_length

    # Update track_x to move in one direction (0.0 to 1.0)
    state["track_x"] = state["track_position"]

    # Determine sector based on position (3 sectors evenly divided)
    if state["track_position"] < 0.333:
        state["sector"] = 1
    elif state["track_position"] < 0.666:
        state["sector"] = 2
    else:
        state["sector"] = 3

    # Update other telemetry based on sector
    if state["sector"] == 1:  # Fast section
        state["throttle_pct"] = random.uniform(0.8, 1.0)
        state["brake_pct"] = random.uniform(0, 0.2)
        state["gear"] = random.randint(6, 8)
    elif state["sector"] == 2:  # Medium section
        state["throttle_pct"] = random.uniform(0.5, 0.8)
        state["brake_pct"] = random.uniform(0.1, 0.4)
        state["gear"] = random.randint(4, 6)
    else:  # Slow section (turns)
        state["throttle_pct"] = random.uniform(0.3, 0.6)
        state["brake_pct"] = random.uniform(0.3, 0.7)
        state["gear"] = random.randint(3, 5)

    state["last_update"] = datetime.now()
    return state

# Background task to process Kafka messages
async def process_kafka_messages():
    """Background task to consume Kafka messages and broadcast to WebSocket clients"""
    import random
    import time

    # Initialize multiple drivers
    num_drivers = 3
    allowed_drivers = ["driver_1", "driver_2", "driver_3"]
    last_update_time = time.time()

    # Clear any old driver states that are not in allowed list
    driver_states.clear()

    while True:
        try:
            # Check if Kafka consumer is available
            if not kafka_consumer.telemetry_consumer:
                current_time = time.time()
                delta_time = current_time - last_update_time
                last_update_time = current_time

                # Update each driver - only the allowed drivers
                for driver_id in allowed_drivers:

                    # Update driver position with time-based progression
                    state = update_driver_position(driver_id, delta_time)

                    # Create telemetry data
                    mock_telemetry = {
                        "ts": datetime.now().isoformat(),
                        "driver_id": driver_id,
                        "lap": state["lap"],
                        "distance_m": state["distance_m"],
                        "sector": state["sector"],
                        "track_x": state["track_x"],  # 0.0 to 1.0 progression
                        "speed_kph": state["speed_kph"],
                        "throttle_pct": state["throttle_pct"],
                        "brake_pct": state["brake_pct"],
                        "gear": state["gear"]
                    }

                    # Detect anomalies (5% chance)
                    anomaly_result = None
                    if random.random() < 0.05:
                        anomaly_result = await anomaly_detector.detect_anomaly(mock_telemetry)

                    # Broadcast to all connections
                    await manager.broadcast(json.dumps({
                        "type": "telemetry",
                        "data": mock_telemetry,
                        "anomaly": anomaly_result
                    }))

                    # Broadcast to specific driver connections
                    if anomaly_result and anomaly_result.get("is_anomaly"):
                        await manager.broadcast_to_driver(json.dumps({
                            "type": "anomaly",
                            "data": anomaly_result
                        }), driver_id)

                # Generate mock radio data at reduced frequency
                if random.random() < 0.03:  # 3% chance per update cycle (slower updates)
                    radio_messages = [
                        "Box this lap, box this lap",
                        "Push push push, maximize speed",
                        "Pace is good, keep pushing",
                        "Traffic ahead, be careful",
                        "Gap to car ahead is 2 seconds",
                        "Save the engine, lift and coast",
                        "DRS available next lap",
                        "Save fuel, reduce throttle",
                        "Defend defend, car behind",
                        "Hold position, maintain pace",
                        "Plan B, plan B",
                        "Full speed ahead on the straight",
                        "Undercut window now",
                        "Tire degradation increasing",
                        "Multi 21, multi 21"
                    ]

                    driver_num = random.randint(1, 3)
                    mock_radio = {
                        "ts": datetime.now().isoformat(),
                        "team": f"Team {driver_num}",
                        "driver_id": f"driver_{driver_num}",
                        "text": random.choice(radio_messages)
                    }

                    await manager.broadcast(json.dumps({
                        "type": "radio",
                        "data": mock_radio
                    }))

                await asyncio.sleep(0.1)  # Update 10 times per second for smooth movement
                continue
                
            # Get telemetry data from Kafka
            telemetry_messages = await kafka_consumer.consume_telemetry()
            for message in telemetry_messages:
                # Detect anomalies
                anomaly_result = await anomaly_detector.detect_anomaly(message)
                
                # Broadcast to all connections
                await manager.broadcast(json.dumps({
                    "type": "telemetry",
                    "data": message,
                    "anomaly": anomaly_result
                }))
                
                # Broadcast to specific driver connections
                if anomaly_result and anomaly_result.get("is_anomaly"):
                    await manager.broadcast_to_driver(json.dumps({
                        "type": "anomaly",
                        "data": anomaly_result
                    }), message["driver_id"])
            
            # Get radio transcripts from Kafka
            radio_messages = await kafka_consumer.consume_radio()
            for message in radio_messages:
                # Broadcast radio transcripts
                await manager.broadcast(json.dumps({
                    "type": "radio",
                    "data": message
                }))
                
                # Generate driver summary if significant
                if message.get("text"):
                    summary = await driver_summarizer.generate_summary(
                        message["driver_id"], 
                        message["text"]
                    )
                    if summary:
                        await manager.broadcast_to_driver(json.dumps({
                            "type": "summary",
                            "data": summary
                        }), message["driver_id"])
            
            await asyncio.sleep(0.1)  # Small delay to prevent overwhelming
            
        except Exception as e:
            logger.error(f"Error processing Kafka messages: {e}")
            await asyncio.sleep(1)

@app.on_event("startup")
async def startup_event():
    """Initialize services and start background tasks"""
    logger.info("Starting F1 Race Engineer AI Gateway...")
    
    # Initialize Kafka consumer (temporarily disabled for debugging)
    try:
        await kafka_consumer.initialize()
        logger.info("Kafka consumer initialized successfully")
    except Exception as e:
        logger.warning(f"Kafka consumer initialization failed: {e}")
        logger.warning("Continuing without Kafka consumer...")
    
    # Start background task for processing messages
    asyncio.create_task(process_kafka_messages())
    
    logger.info("Gateway started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down F1 Race Engineer AI Gateway...")
    await kafka_consumer.close()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
