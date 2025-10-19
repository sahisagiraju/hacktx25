"""
F1 Race Engineer AI - Main FastAPI Gateway
Real-time WebSocket gateway for telemetry and radio data
"""

import asyncio
import json
import logging
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

@app.get("/")
async def root():
    return {"message": "F1 Race Engineer AI Gateway", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

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

# Background task to process Kafka messages
async def process_kafka_messages():
    """Background task to consume Kafka messages and broadcast to WebSocket clients"""
    while True:
        try:
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
    
    # Initialize Kafka consumer
    await kafka_consumer.initialize()
    
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
