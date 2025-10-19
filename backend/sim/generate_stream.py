#!/usr/bin/env python3
"""
F1 Telemetry Stream Generator
Generates realistic F1 telemetry data for testing and development
"""

import argparse
import asyncio
import json
import random
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import csv
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class F1TelemetrySimulator:
    def __init__(self, drivers: int = 2, laps: int = 6):
        self.drivers = drivers
        self.laps = laps
        self.driver_ids = [f"DRIVER_{chr(65+i)}" for i in range(drivers)]
        self.teams = [f"TEAM_{chr(65+i)}" for i in range(drivers)]
        
        # Track configuration (simplified F1 track)
        self.track_length = 5000  # meters
        self.sectors = 3
        self.sector_length = self.track_length / self.sectors
        
        # Driver characteristics
        self.driver_profiles = self._create_driver_profiles()
        
        # Radio phrases for simulation
        self.radio_phrases = [
            "Box box box",
            "Full speed ahead", 
            "Push push push",
            "Save fuel",
            "Watch your mirrors",
            "Clear to pass",
            "Stay out",
            "Box this lap",
            "Keep pushing",
            "Smooth driving",
            "Watch the gap",
            "Maintain position",
            "Attack mode",
            "Defend position",
            "Pit window open"
        ]
    
    def _create_driver_profiles(self) -> Dict[str, Dict[str, Any]]:
        """Create different driver profiles with varying characteristics"""
        profiles = {}
        
        for i, driver_id in enumerate(self.driver_ids):
            # Create different driving styles
            if i == 0:  # Aggressive driver
                profiles[driver_id] = {
                    "base_speed": 280,
                    "speed_variance": 15,
                    "throttle_aggression": 0.8,
                    "brake_aggression": 0.7,
                    "gear_shift_style": "aggressive",
                    "fuel_efficiency": 0.6
                }
            elif i == 1:  # Conservative driver
                profiles[driver_id] = {
                    "base_speed": 270,
                    "speed_variance": 10,
                    "throttle_aggression": 0.6,
                    "brake_aggression": 0.5,
                    "gear_shift_style": "smooth",
                    "fuel_efficiency": 0.8
                }
            else:  # Balanced driver
                profiles[driver_id] = {
                    "base_speed": 275,
                    "speed_variance": 12,
                    "throttle_aggression": 0.7,
                    "brake_aggression": 0.6,
                    "gear_shift_style": "balanced",
                    "fuel_efficiency": 0.7
                }
        
        return profiles
    
    def generate_telemetry_point(self, driver_id: str, lap: int, distance: float, 
                                sector: int) -> Dict[str, Any]:
        """Generate a single telemetry data point"""
        profile = self.driver_profiles[driver_id]
        
        # Calculate position on track (0.0 to 1.0)
        track_position = (distance % self.track_length) / self.track_length
        
        # Generate speed based on track position and driver profile
        speed = self._calculate_speed(profile, track_position, sector)
        
        # Generate throttle and brake based on speed and position
        throttle, brake = self._calculate_throttle_brake(profile, speed, track_position)
        
        # Generate gear based on speed
        gear = self._calculate_gear(speed, profile)
        
        # Add some randomness for realism
        speed += random.uniform(-5, 5)
        throttle = max(0, min(1, throttle + random.uniform(-0.05, 0.05)))
        brake = max(0, min(1, brake + random.uniform(-0.02, 0.02)))
        
        return {
            "ts": datetime.now().isoformat(),
            "driver_id": driver_id,
            "lap": lap,
            "distance_m": distance,
            "sector": sector,
            "track_x": track_position,
            "speed_kph": round(speed, 1),
            "throttle_pct": round(throttle, 3),
            "brake_pct": round(brake, 3),
            "gear": gear
        }
    
    def _calculate_speed(self, profile: Dict[str, Any], track_position: float, 
                       sector: int) -> float:
        """Calculate speed based on track position and driver profile"""
        base_speed = profile["base_speed"]
        variance = profile["speed_variance"]
        
        # Speed varies by track position (slower in corners, faster on straights)
        if 0.0 <= track_position < 0.2:  # Straight
            speed_multiplier = 1.0
        elif 0.2 <= track_position < 0.4:  # Corner entry
            speed_multiplier = 0.7
        elif 0.4 <= track_position < 0.6:  # Corner apex
            speed_multiplier = 0.5
        elif 0.6 <= track_position < 0.8:  # Corner exit
            speed_multiplier = 0.8
        else:  # Straight
            speed_multiplier = 1.0
        
        # Add sector-based variation
        sector_multiplier = 1.0 + (sector - 1) * 0.1  # Slight increase per sector
        
        return base_speed * speed_multiplier * sector_multiplier + random.uniform(-variance, variance)
    
    def _calculate_throttle_brake(self, profile: Dict[str, Any], speed: float, 
                                 track_position: float) -> tuple:
        """Calculate throttle and brake percentages"""
        throttle_aggression = profile["throttle_aggression"]
        brake_aggression = profile["brake_aggression"]
        
        # Base throttle based on speed (higher speed = more throttle)
        base_throttle = min(1.0, speed / 300.0) * throttle_aggression
        
        # Adjust for track position
        if 0.0 <= track_position < 0.2:  # Straight - high throttle
            throttle = base_throttle * 1.0
            brake = 0.0
        elif 0.2 <= track_position < 0.4:  # Corner entry - braking
            throttle = base_throttle * 0.3
            brake = brake_aggression * 0.8
        elif 0.4 <= track_position < 0.6:  # Corner apex - coasting
            throttle = base_throttle * 0.1
            brake = brake_aggression * 0.2
        elif 0.6 <= track_position < 0.8:  # Corner exit - accelerating
            throttle = base_throttle * 0.8
            brake = brake_aggression * 0.1
        else:  # Straight - high throttle
            throttle = base_throttle * 1.0
            brake = 0.0
        
        return min(1.0, throttle), min(1.0, brake)
    
    def _calculate_gear(self, speed: float, profile: Dict[str, Any]) -> int:
        """Calculate gear based on speed"""
        # Simplified gear calculation
        if speed < 50:
            return 1
        elif speed < 100:
            return 2
        elif speed < 150:
            return 3
        elif speed < 200:
            return 4
        elif speed < 250:
            return 5
        elif speed < 300:
            return 6
        else:
            return 7
    
    def generate_radio_message(self, driver_id: str) -> Dict[str, Any]:
        """Generate a random radio message"""
        team = self.teams[self.driver_ids.index(driver_id)]
        phrase = random.choice(self.radio_phrases)
        
        return {
            "ts": datetime.now().isoformat(),
            "team": team,
            "driver_id": driver_id,
            "text": phrase
        }
    
    async def generate_stream(self, output_format: str = "json", 
                            output_file: Optional[str] = None) -> None:
        """Generate telemetry stream"""
        print(f"Generating F1 telemetry stream for {self.drivers} drivers, {self.laps} laps...")
        
        telemetry_data = []
        radio_data = []
        
        for lap in range(1, self.laps + 1):
            print(f"Generating lap {lap}...")
            
            for driver_id in self.driver_ids:
                # Generate telemetry for this lap
                distance = 0
                sector = 1
                
                while distance < self.track_length:
                    # Generate telemetry point
                    telemetry_point = self.generate_telemetry_point(
                        driver_id, lap, distance, sector
                    )
                    telemetry_data.append(telemetry_point)
                    
                    # Update distance and sector
                    distance += random.uniform(50, 100)  # Variable distance increments
                    sector = min(3, int(distance / self.sector_length) + 1)
                    
                    # Small delay for realism
                    await asyncio.sleep(0.01)
                
                # Generate occasional radio messages
                if random.random() < 0.3:  # 30% chance of radio message per lap
                    radio_message = self.generate_radio_message(driver_id)
                    radio_data.append(radio_message)
        
        # Output data
        if output_format == "json":
            self._output_json(telemetry_data, radio_data, output_file)
        elif output_format == "csv":
            self._output_csv(telemetry_data, radio_data, output_file)
        else:
            print("Invalid output format. Use 'json' or 'csv'")
    
    def _output_json(self, telemetry_data: List[Dict], radio_data: List[Dict], 
                    output_file: Optional[str] = None):
        """Output data in JSON format"""
        output = {
            "telemetry": telemetry_data,
            "radio": radio_data,
            "metadata": {
                "drivers": self.driver_ids,
                "laps": self.laps,
                "generated_at": datetime.now().isoformat(),
                "total_telemetry_points": len(telemetry_data),
                "total_radio_messages": len(radio_data)
            }
        }
        
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(output, f, indent=2)
            print(f"Data saved to {output_file}")
        else:
            print(json.dumps(output, indent=2))
    
    def _output_csv(self, telemetry_data: List[Dict], radio_data: List[Dict], 
                   output_file: Optional[str] = None):
        """Output data in CSV format"""
        if output_file:
            # Write telemetry CSV
            telemetry_file = output_file.replace('.csv', '_telemetry.csv')
            with open(telemetry_file, 'w', newline='') as f:
                if telemetry_data:
                    writer = csv.DictWriter(f, fieldnames=telemetry_data[0].keys())
                    writer.writeheader()
                    writer.writerows(telemetry_data)
            
            # Write radio CSV
            radio_file = output_file.replace('.csv', '_radio.csv')
            with open(radio_file, 'w', newline='') as f:
                if radio_data:
                    writer = csv.DictWriter(f, fieldnames=radio_data[0].keys())
                    writer.writeheader()
                    writer.writerows(radio_data)
            
            print(f"Telemetry data saved to {telemetry_file}")
            print(f"Radio data saved to {radio_file}")
        else:
            print("CSV output requires output file parameter")

async def main():
    parser = argparse.ArgumentParser(description="F1 Telemetry Stream Generator")
    parser.add_argument("--drivers", type=int, default=2, help="Number of drivers")
    parser.add_argument("--laps", type=int, default=6, help="Number of laps")
    parser.add_argument("--format", choices=["json", "csv"], default="json", 
                       help="Output format")
    parser.add_argument("--output", type=str, help="Output file path")
    parser.add_argument("--to", choices=["json", "csv"], help="Alias for --format")
    
    args = parser.parse_args()
    
    # Handle --to alias
    if args.to:
        args.format = args.to
    
    simulator = F1TelemetrySimulator(drivers=args.drivers, laps=args.laps)
    await simulator.generate_stream(args.format, args.output)

if __name__ == "__main__":
    asyncio.run(main())
