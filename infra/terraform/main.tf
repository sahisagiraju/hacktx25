# Minimal F1 Race Engineer AI Infrastructure
# This version only creates basic resources that don't require special permissions

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}

# Random ID for unique bucket names
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# S3 Bucket for Data Lake (minimal permissions required)
resource "aws_s3_bucket" "f1_data_lake" {
  bucket = "f1-race-engineer-data-lake-${random_id.bucket_suffix.hex}"

  tags = {
    Name        = "f1-race-engineer-data-lake"
    Environment = "dev"
  }
}

resource "aws_s3_bucket_versioning" "f1_data_lake_versioning" {
  bucket = aws_s3_bucket.f1_data_lake.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Outputs
output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.f1_data_lake.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.f1_data_lake.arn
}
