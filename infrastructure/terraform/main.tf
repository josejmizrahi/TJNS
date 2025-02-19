terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

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

# Core infrastructure modules
module "vpc" {
  source = "./modules/vpc"

  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
}

module "eks" {
  source = "./modules/eks"

  environment         = var.environment
  private_subnet_ids  = module.vpc.private_subnet_ids
  cluster_version     = "1.27"
  min_size            = 3
  max_size            = 6
  desired_size        = 3
  node_instance_types = ["m5.large"]
}

module "rds" {
  source = "./modules/rds"

  environment             = var.environment
  vpc_id                  = module.vpc.vpc_id
  subnet_ids              = module.vpc.database_subnet_ids
  instance_class          = "db.m5.large"
  allocated_storage       = 100
  backup_retention_period = 14
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"
}

module "redis" {
  source = "./modules/redis"

  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  node_type          = "cache.m5.large"
  num_cache_clusters = 2
}

module "security" {
  source = "./modules/security"

  environment                   = var.environment
  vpc_id                        = module.vpc.vpc_id
  eks_cluster_security_group_id = module.eks.cluster_security_group_id
  eks_node_security_group_id    = module.eks.node_security_group_id
  rds_security_group_id         = module.rds.security_group_id
  redis_security_group_id       = module.redis.security_group_id
}

module "monitoring" {
  source = "./modules/monitoring"

  environment      = var.environment
  eks_cluster_name = module.eks.cluster_id
  rds_instance_id  = module.rds.endpoint
  redis_cluster_id = module.redis.primary_endpoint
  alarm_actions    = []
}
