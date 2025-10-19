"""
Kafka Consumer Service for F1 Race Engineer AI
Handles telemetry and radio data consumption from Kafka topics
"""

import asyncio
import json
import logging
from typing import List, Dict, Any, Optional
from kafka import KafkaConsumer
from kafka.errors import KafkaError
import os

logger = logging.getLogger(__name__)

class KafkaConsumer:
    def __init__(self):
        self.telemetry_consumer: Optional[KafkaConsumer] = None
        self.radio_consumer: Optional[KafkaConsumer] = None
        self.kafka_bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
        self.telemetry_topic = os.getenv("TELEMETRY_TOPIC", "telemetry")
        self.radio_topic = os.getenv("RADIO_TOPIC", "radio")
        
    async def initialize(self):
        """Initialize Kafka consumers"""
        try:
            # Initialize telemetry consumer
            self.telemetry_consumer = KafkaConsumer(
                self.telemetry_topic,
                bootstrap_servers=self.kafka_bootstrap_servers,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                auto_offset_reset='latest',
                enable_auto_commit=True,
                group_id='f1_race_engineer_telemetry'
            )
            
            # Initialize radio consumer
            self.radio_consumer = KafkaConsumer(
                self.radio_topic,
                bootstrap_servers=self.kafka_bootstrap_servers,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                auto_offset_reset='latest',
                enable_auto_commit=True,
                group_id='f1_race_engineer_radio'
            )
            
            logger.info("Kafka consumers initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Kafka consumers: {e}")
            raise
    
    async def consume_telemetry(self) -> List[Dict[str, Any]]:
        """Consume telemetry messages from Kafka"""
        messages = []
        
        if not self.telemetry_consumer:
            return messages
            
        try:
            # Poll for messages with timeout
            message_batch = self.telemetry_consumer.poll(timeout_ms=100)
            
            for topic_partition, records in message_batch.items():
                for record in records:
                    try:
                        message = record.value
                        if message:
                            messages.append(message)
                    except Exception as e:
                        logger.error(f"Error processing telemetry message: {e}")
                        
        except KafkaError as e:
            logger.error(f"Kafka error consuming telemetry: {e}")
        except Exception as e:
            logger.error(f"Error consuming telemetry: {e}")
            
        return messages
    
    async def consume_radio(self) -> List[Dict[str, Any]]:
        """Consume radio messages from Kafka"""
        messages = []
        
        if not self.radio_consumer:
            return messages
            
        try:
            # Poll for messages with timeout
            message_batch = self.radio_consumer.poll(timeout_ms=100)
            
            for topic_partition, records in message_batch.items():
                for record in records:
                    try:
                        message = record.value
                        if message:
                            messages.append(message)
                    except Exception as e:
                        logger.error(f"Error processing radio message: {e}")
                        
        except KafkaError as e:
            logger.error(f"Kafka error consuming radio: {e}")
        except Exception as e:
            logger.error(f"Error consuming radio: {e}")
            
        return messages
    
    async def close(self):
        """Close Kafka consumers"""
        try:
            if self.telemetry_consumer:
                self.telemetry_consumer.close()
            if self.radio_consumer:
                self.radio_consumer.close()
            logger.info("Kafka consumers closed successfully")
        except Exception as e:
            logger.error(f"Error closing Kafka consumers: {e}")
