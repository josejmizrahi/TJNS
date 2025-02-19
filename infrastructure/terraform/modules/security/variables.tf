variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "eks_cluster_security_group_id" {
  description = "Security group ID of the EKS cluster"
  type        = string
}

variable "eks_node_security_group_id" {
  description = "Security group ID of the EKS nodes"
  type        = string
}

variable "rds_security_group_id" {
  description = "Security group ID of the RDS instance"
  type        = string
}

variable "redis_security_group_id" {
  description = "Security group ID of the Redis cluster"
  type        = string
}
