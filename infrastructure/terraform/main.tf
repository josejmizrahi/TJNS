terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    # Will be configured during deployment
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

# Core networking
module "vpc" {
  source = "./modules/vpc"
  
  environment        = var.environment
  vpc_cidr          = var.vpc_cidr
  availability_zones = var.availability_zones
}

# Security groups
module "security_groups" {
  source = "./modules/security"
  
  vpc_id      = module.vpc.vpc_id
  environment = var.environment
}

# EKS cluster
module "eks" {
  source = "./modules/eks"
  
  cluster_name    = "tjns-${var.environment}"
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  environment    = var.environment
}

# RDS database
module "rds" {
  source = "./modules/rds"
  
  identifier     = "tjns-${var.environment}"
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.database_subnet_ids
  environment    = var.environment
}

# Redis for caching
module "redis" {
  source = "./modules/redis"
  
  cluster_id     = "tjns-${var.environment}"
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  environment    = var.environment
}
