"""
Driver Summarization Service for F1 Race Engineer AI
Generates AI-powered driver summaries using Gemini API
"""

import asyncio
import logging
import os
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import json

# Gemini API integration
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logging.warning("Google Generative AI not available. Summarization will be simulated.")

logger = logging.getLogger(__name__)

class DriverSummarizer:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.gemini_model = None
        self.simulation_mode = not GEMINI_AVAILABLE or not self.gemini_api_key
        
        # Driver performance templates for simulation
        self.summary_templates = {
            "aggressive": "Driver showing aggressive driving patterns with high throttle usage and late braking.",
            "conservative": "Driver maintaining conservative approach with smooth throttle application and early braking.",
            "efficient": "Driver demonstrating excellent fuel efficiency and smooth driving style.",
            "struggling": "Driver experiencing difficulties with car balance and track conditions.",
            "excellent": "Driver performing exceptionally well with optimal lap times and smooth driving."
        }
        
        if not self.simulation_mode:
            self._initialize_gemini()
    
    def _initialize_gemini(self):
        """Initialize Gemini API client"""
        try:
            if self.gemini_api_key:
                genai.configure(api_key=self.gemini_api_key)
                self.gemini_model = genai.GenerativeModel('gemini-pro')
                logger.info("Gemini API client initialized successfully")
            else:
                logger.warning("Gemini API key not found. Using simulation mode.")
                self.simulation_mode = True
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            self.simulation_mode = True
    
    async def generate_summary(self, driver_id: str, context: str = None) -> Optional[Dict[str, Any]]:
        """Generate AI-powered driver summary"""
        try:
            if self.simulation_mode:
                return await self._simulate_summary(driver_id, context)
            
            if not self.gemini_model:
                logger.error("Gemini model not initialized")
                return None
            
            # Generate summary using Gemini
            summary = await self._generate_with_gemini(driver_id, context)
            
            if summary:
                return {
                    "driver_id": driver_id,
                    "timestamp": datetime.now().isoformat(),
                    "summary": summary,
                    "context": context,
                    "source": "gemini",
                    "confidence": 0.9
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return None
    
    async def _generate_with_gemini(self, driver_id: str, context: str = None) -> Optional[str]:
        """Generate summary using Gemini API"""
        try:
            # Create prompt for Gemini
            prompt = self._create_summary_prompt(driver_id, context)
            
            # Generate response
            response = await asyncio.get_event_loop().run_in_executor(
                None, 
                lambda: self.gemini_model.generate_content(prompt)
            )
            
            return response.text if response and response.text else None
            
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            return None
    
    def _create_summary_prompt(self, driver_id: str, context: str = None) -> str:
        """Create prompt for Gemini API"""
        base_prompt = f"""
        You are an F1 race engineer AI analyzing driver {driver_id}'s performance.
        
        Based on the telemetry data and radio communications, provide a concise summary of:
        1. Current driving style and performance
        2. Any anomalies or notable patterns
        3. Recommendations for the driver
        4. Overall assessment
        
        Keep the summary professional and technical, suitable for race engineering.
        """
        
        if context:
            base_prompt += f"\n\nRecent context: {context}"
        
        return base_prompt
    
    async def _simulate_summary(self, driver_id: str, context: str = None) -> Dict[str, Any]:
        """Simulate driver summary for development/testing"""
        import random
        
        # Simulate different performance scenarios
        performance_type = random.choice(list(self.summary_templates.keys()))
        base_summary = self.summary_templates[performance_type]
        
        # Add context-specific details
        if context:
            if "speed" in context.lower():
                base_summary += " Notable speed variations detected."
            if "fuel" in context.lower():
                base_summary += " Fuel management strategy being implemented."
            if "push" in context.lower():
                base_summary += " Aggressive driving mode activated."
        
        return {
            "driver_id": driver_id,
            "timestamp": datetime.now().isoformat(),
            "summary": base_summary,
            "context": context,
            "source": "simulation",
            "confidence": random.uniform(0.7, 0.9),
            "performance_type": performance_type
        }
    
    async def generate_lap_summary(self, driver_id: str, lap_data: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Generate summary for a specific lap"""
        try:
            if not lap_data:
                return None
            
            # Analyze lap data
            lap_analysis = self._analyze_lap_data(lap_data)
            
            if self.simulation_mode:
                summary = await self._simulate_lap_summary(driver_id, lap_analysis)
            else:
                summary = await self._generate_lap_summary_with_gemini(driver_id, lap_analysis)
            
            if summary:
                return {
                    "driver_id": driver_id,
                    "lap_number": lap_analysis.get("lap_number", 0),
                    "timestamp": datetime.now().isoformat(),
                    "summary": summary,
                    "lap_stats": lap_analysis,
                    "source": "simulation" if self.simulation_mode else "gemini"
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error generating lap summary: {e}")
            return None
    
    def _analyze_lap_data(self, lap_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze lap data for summary generation"""
        try:
            if not lap_data:
                return {}
            
            # Calculate basic statistics
            speeds = [entry.get("speed_kph", 0) for entry in lap_data if "speed_kph" in entry]
            throttles = [entry.get("throttle_pct", 0) for entry in lap_data if "throttle_pct" in entry]
            brakes = [entry.get("brake_pct", 0) for entry in lap_data if "brake_pct" in entry]
            
            analysis = {
                "lap_number": lap_data[0].get("lap", 0) if lap_data else 0,
                "data_points": len(lap_data),
                "avg_speed": sum(speeds) / len(speeds) if speeds else 0,
                "max_speed": max(speeds) if speeds else 0,
                "avg_throttle": sum(throttles) / len(throttles) if throttles else 0,
                "avg_brake": sum(brakes) / len(brakes) if brakes else 0,
                "time_range": {
                    "start": lap_data[0].get("ts") if lap_data else None,
                    "end": lap_data[-1].get("ts") if lap_data else None
                }
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing lap data: {e}")
            return {}
    
    async def _simulate_lap_summary(self, driver_id: str, lap_analysis: Dict[str, Any]) -> str:
        """Simulate lap summary"""
        import random
        
        lap_num = lap_analysis.get("lap_number", 0)
        avg_speed = lap_analysis.get("avg_speed", 0)
        
        if avg_speed > 250:
            performance = "excellent"
        elif avg_speed > 200:
            performance = "good"
        else:
            performance = "struggling"
        
        templates = {
            "excellent": f"Outstanding lap {lap_num} with consistent high-speed performance.",
            "good": f"Solid lap {lap_num} with good pace and smooth driving.",
            "struggling": f"Challenging lap {lap_num} with some areas for improvement."
        }
        
        return templates.get(performance, f"Lap {lap_num} completed with mixed performance.")
    
    async def _generate_lap_summary_with_gemini(self, driver_id: str, lap_analysis: Dict[str, Any]) -> Optional[str]:
        """Generate lap summary using Gemini"""
        try:
            prompt = f"""
            Analyze this F1 lap data for driver {driver_id}:
            
            Lap Number: {lap_analysis.get('lap_number', 0)}
            Average Speed: {lap_analysis.get('avg_speed', 0)} km/h
            Max Speed: {lap_analysis.get('max_speed', 0)} km/h
            Average Throttle: {lap_analysis.get('avg_throttle', 0)}%
            Average Brake: {lap_analysis.get('avg_brake', 0)}%
            
            Provide a concise technical summary of the lap performance.
            """
            
            response = await asyncio.get_event_loop().run_in_executor(
                None, 
                lambda: self.gemini_model.generate_content(prompt)
            )
            
            return response.text if response and response.text else None
            
        except Exception as e:
            logger.error(f"Error generating lap summary with Gemini: {e}")
            return None
    
    def is_simulation_mode(self) -> bool:
        """Check if running in simulation mode"""
        return self.simulation_mode
    
    async def get_summarization_stats(self) -> Dict[str, Any]:
        """Get summarization service statistics"""
        return {
            "simulation_mode": self.simulation_mode,
            "gemini_available": GEMINI_AVAILABLE,
            "api_key_configured": bool(self.gemini_api_key),
            "available_templates": len(self.summary_templates)
        }
