#!/bin/bash

# F1 Race Engineer AI - Docker Setup Script
echo "🏎️  Setting up F1 Race Engineer AI with Docker..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# F1 Race Engineer AI - Environment Variables
# Development configuration for local Docker setup

# API Keys (add your actual keys here)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
TELEMETRY_TOPIC=telemetry
RADIO_TOPIC=radio

# Redis Configuration
REDIS_URL=redis://redis:6379

# Database Configuration (for future use)
DATABASE_URL=postgresql://user:password@localhost:5432/f1_race_engineer

# AWS Configuration (for production - not needed for local)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-west-2
S3_BUCKET_NAME=your_s3_bucket_name

# DigitalOcean Configuration (for production - not needed for local)
DO_TOKEN=your_digitalocean_token
DO_REGION=nyc3

# Application Configuration
LOG_LEVEL=INFO
DEBUG=true
ENVIRONMENT=development

# Frontend Configuration
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_API_URL=http://localhost:8000
EOF
    echo "✅ .env file created! Please edit it with your actual API keys."
else
    echo "✅ .env file already exists"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "🐳 Building and starting Docker containers..."

# Build and start the services
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "🎉 F1 Race Engineer AI is starting up!"
echo ""
echo "📊 Services:"
echo "  • Frontend: http://localhost:3000"
echo "  • Backend API: http://localhost:8000"
echo "  • Kafka: localhost:9092"
echo "  • Redis: localhost:6379"
echo ""
echo "📝 Next steps:"
echo "  1. Edit .env file with your actual API keys"
echo "  2. Visit http://localhost:3000 to see the dashboard"
echo "  3. Check logs with: docker-compose logs -f"
echo ""
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
