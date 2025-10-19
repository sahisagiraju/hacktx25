# 🏎️ F1 Race Engineer AI - Docker Setup

## Quick Start

### 1. Prerequisites
- Docker Desktop installed and running
- Git (to clone the repository)

### 2. Setup and Run

```bash
# Make the setup script executable and run it
chmod +x setup-docker.sh
./setup-docker.sh
```

This will:
- Create a `.env` file with default configuration
- Build all Docker containers
- Start all services
- Show you the service URLs

### 3. Access the Application

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### 4. Configure API Keys

Edit the `.env` file and add your actual API keys:

```bash
# Required for full functionality
ELEVENLABS_API_KEY=your_actual_elevenlabs_key
GEMINI_API_KEY=your_actual_gemini_key
```

### 5. Monitor Services

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f gateway
docker-compose logs -f frontend
docker-compose logs -f simulator
```

### 6. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Services Overview

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React dashboard with galaxy theme |
| Gateway | 8000 | FastAPI backend with WebSocket |
| Kafka | 9092 | Message streaming |
| Redis | 6379 | Caching and session storage |
| Simulator | - | Generates F1 telemetry data |

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :8000
   
   # Kill the process or change ports in docker-compose.yml
   ```

2. **Docker build fails**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Services not connecting**
   ```bash
   # Check service status
   docker-compose ps
   
   # Check logs for errors
   docker-compose logs gateway
   ```

4. **Frontend not loading**
   - Check if backend is running: http://localhost:8000/health
   - Check browser console for errors
   - Verify WebSocket connection in Network tab

### Development Mode

For development with hot reload:

```bash
# Run in development mode (with volume mounts)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Gateway       │    │   Simulator     │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (Python)      │
│   Port: 3000    │    │   Port: 8000    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │     Kafka       │              │
         │              │   Port: 9092    │              │
         │              └─────────────────┘              │
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│     Redis       │◄─────────────┘
                        │   Port: 6379    │
                        └─────────────────┘
```

## Next Steps

1. **Add your API keys** to the `.env` file
2. **Visit the dashboard** at http://localhost:3000
3. **Check the API docs** at http://localhost:8000/docs
4. **Monitor the simulator** generating F1 telemetry data
5. **Explore the WebSocket** real-time data stream

## Production Deployment

For production deployment, see:
- `infra/terraform/` - AWS infrastructure
- `infra/doks-terraform/` - DigitalOcean Kubernetes
- `k8s/` - Kubernetes manifests
- `scripts/deploy.sh` - Deployment script
