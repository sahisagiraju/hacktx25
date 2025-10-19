#!/bin/bash

# F1 Race Engineer AI - Deployment Script
# This script deploys the F1 Race Engineer AI application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    if ! command -v kubectl &> /dev/null; then
        missing_deps+=("kubectl")
    fi
    
    if ! command -v terraform &> /dev/null; then
        missing_deps+=("terraform")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_error "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Deploy locally with Docker Compose
deploy_local() {
    print_status "Deploying locally with Docker Compose..."
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        print_warning "No .env file found. Copying from env.example..."
        cp env.example .env
        print_warning "Please edit .env file with your actual API keys before running the application."
    fi
    
    # Build and start services
    docker-compose down --remove-orphans
    docker-compose build
    docker-compose up -d
    
    print_success "Local deployment completed!"
    print_status "Services are starting up..."
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:8000"
    print_status "Kafka: localhost:9092"
    print_status "Redis: localhost:6379"
}

# Deploy to Kubernetes
deploy_k8s() {
    print_status "Deploying to Kubernetes..."
    
    # Check if kubectl is configured
    if ! kubectl cluster-info &> /dev/null; then
        print_error "kubectl is not configured or cluster is not accessible"
        exit 1
    fi
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secret.yaml
    kubectl apply -f k8s/gateway-deployment.yaml
    kubectl apply -f k8s/simulator-deployment.yaml
    kubectl apply -f k8s/frontend-deployment.yaml
    kubectl apply -f k8s/services.yaml
    kubectl apply -f k8s/ingress.yaml
    
    print_success "Kubernetes deployment completed!"
    print_status "Waiting for pods to be ready..."
    kubectl wait --for=condition=ready pod -l app=f1-gateway -n f1-race-engineer --timeout=300s
    kubectl wait --for=condition=ready pod -l app=f1-frontend -n f1-race-engineer --timeout=300s
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    local provider=$1
    
    if [ "$provider" = "aws" ]; then
        print_status "Deploying AWS infrastructure..."
        cd infra/terraform
        terraform init
        terraform plan
        terraform apply -auto-approve
        print_success "AWS infrastructure deployed!"
    elif [ "$provider" = "digitalocean" ]; then
        print_status "Deploying DigitalOcean infrastructure..."
        cd infra/doks-terraform
        terraform init
        terraform plan
        terraform apply -auto-approve
        print_success "DigitalOcean infrastructure deployed!"
    else
        print_error "Invalid provider. Use 'aws' or 'digitalocean'"
        exit 1
    fi
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build backend image
    docker build -t f1-race-engineer/gateway:latest ./backend
    docker build -t f1-race-engineer/simulator:latest ./backend
    docker build -t f1-race-engineer/frontend:latest ./frontend
    
    print_success "Docker images built successfully!"
}

# Clean up resources
cleanup() {
    print_status "Cleaning up resources..."
    
    # Stop Docker Compose services
    docker-compose down --remove-orphans
    
    # Remove Docker images
    docker rmi f1-race-engineer/gateway:latest 2>/dev/null || true
    docker rmi f1-race-engineer/simulator:latest 2>/dev/null || true
    docker rmi f1-race-engineer/frontend:latest 2>/dev/null || true
    
    # Remove Kubernetes resources
    kubectl delete -f k8s/ 2>/dev/null || true
    
    print_success "Cleanup completed!"
}

# Show help
show_help() {
    echo "F1 Race Engineer AI - Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  local                    Deploy locally with Docker Compose"
    echo "  k8s                      Deploy to Kubernetes"
    echo "  infrastructure [provider] Deploy infrastructure (aws|digitalocean)"
    echo "  build                    Build Docker images"
    echo "  cleanup                  Clean up all resources"
    echo "  help                     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local                 Deploy locally"
    echo "  $0 k8s                   Deploy to Kubernetes"
    echo "  $0 infrastructure aws    Deploy AWS infrastructure"
    echo "  $0 cleanup               Clean up everything"
}

# Main script logic
main() {
    local command=$1
    local option=$2
    
    case $command in
        "local")
            check_dependencies
            deploy_local
            ;;
        "k8s")
            check_dependencies
            deploy_k8s
            ;;
        "infrastructure")
            check_dependencies
            deploy_infrastructure $option
            ;;
        "build")
            build_images
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        "")
            print_error "No command specified"
            show_help
            exit 1
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
