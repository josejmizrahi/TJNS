terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Backend configuration for CI/CD
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "TJNS"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Core networking only for initial setup
module "vpc" {
  source = "./modules/vpc"

  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
}

# Backend configuration will be provided during deployment
