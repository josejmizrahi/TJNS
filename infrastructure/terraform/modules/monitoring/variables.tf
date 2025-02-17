variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "eks_cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "rds_instance_id" {
  description = "ID of the RDS instance"
  type        = string
}

variable "redis_cluster_id" {
  description = "ID of the Redis cluster"
  type        = string
}

variable "alarm_actions" {
  description = "List of ARNs to notify when alarms trigger"
  type        = list(string)
  default     = []
}
