# F1 Race Engineer AI - DigitalOcean Kubernetes Infrastructure
# This Terraform configuration sets up the DigitalOcean infrastructure for the F1 Race Engineer AI system

terraform {
  required_version = ">= 1.0"
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

# VPC
resource "digitalocean_vpc" "f1_vpc" {
  name     = "f1-race-engineer-vpc"
  region   = var.do_region
  ip_range = "10.10.0.0/16"
}

# Kubernetes Cluster
resource "digitalocean_kubernetes_cluster" "f1_cluster" {
  name    = "f1-race-engineer-cluster"
  region  = var.do_region
  version = "1.28.2-do.0"
  vpc_uuid = digitalocean_vpc.f1_vpc.id

  node_pool {
    name       = "worker-pool"
    size       = var.node_size
    node_count = var.node_count
    auto_scale = true
    min_nodes  = 1
    max_nodes  = 5
  }

  tags = ["f1-race-engineer", "kubernetes"]
}

# Spaces Bucket for data storage
resource "digitalocean_spaces_bucket" "f1_data_bucket" {
  name   = "${var.project_name}-data-${random_id.bucket_suffix.hex}"
  region = var.do_region

  lifecycle_rule {
    enabled = true
    expiration {
      days = 30
    }
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Spaces Bucket for application data
resource "digitalocean_spaces_bucket" "f1_app_bucket" {
  name   = "${var.project_name}-app-${random_id.bucket_suffix.hex}"
  region = var.do_region
}

# Database Cluster for metadata
resource "digitalocean_database_cluster" "f1_database" {
  name       = "f1-race-engineer-db"
  engine     = "postgres"
  version    = "15"
  size       = "db-s-1vcpu-1gb"
  region     = var.do_region
  node_count = 1

  tags = ["f1-race-engineer", "database"]
}

# Load Balancer
resource "digitalocean_loadbalancer" "f1_lb" {
  name   = "f1-race-engineer-lb"
  region = var.do_region
  vpc_uuid = digitalocean_vpc.f1_vpc.id

  forwarding_rule {
    entry_protocol  = "http"
    entry_port      = 80
    target_protocol  = "http"
    target_port     = 3000
  }

  forwarding_rule {
    entry_protocol  = "https"
    entry_port      = 443
    target_protocol = "http"
    target_port     = 3000
    tls_passthrough = true
  }

  healthcheck {
    protocol               = "http"
    port                   = 3000
    path                   = "/"
    check_interval_seconds = 10
    response_timeout_seconds = 5
    unhealthy_threshold    = 3
    healthy_threshold      = 2
  }
}

# Firewall
resource "digitalocean_firewall" "f1_firewall" {
  name = "f1-race-engineer-firewall"

  droplet_ids = []

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "8000"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  tags = ["f1-race-engineer", "firewall"]
}

# Outputs
output "cluster_id" {
  description = "ID of the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.f1_cluster.id
}

output "cluster_name" {
  description = "Name of the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.f1_cluster.name
}

output "cluster_endpoint" {
  description = "Endpoint of the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.f1_cluster.endpoint
}

output "cluster_kubeconfig" {
  description = "Kubeconfig for the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.f1_cluster.kube_config
  sensitive   = true
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = digitalocean_vpc.f1_vpc.id
}

output "data_bucket_name" {
  description = "Name of the data Spaces bucket"
  value       = digitalocean_spaces_bucket.f1_data_bucket.name
}

output "app_bucket_name" {
  description = "Name of the app Spaces bucket"
  value       = digitalocean_spaces_bucket.f1_app_bucket.name
}

output "database_host" {
  description = "Host of the database cluster"
  value       = digitalocean_database_cluster.f1_database.host
}

output "database_port" {
  description = "Port of the database cluster"
  value       = digitalocean_database_cluster.f1_database.port
}

output "load_balancer_ip" {
  description = "IP address of the load balancer"
  value       = digitalocean_loadbalancer.f1_lb.ip
}
