variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for EKS deployment"
  type        = list(string)
}

variable "cluster_version" {
  description = "Kubernetes version to use for the EKS cluster"
  type        = string
  default     = "1.27"
}

variable "node_instance_types" {
  description = "List of instance types for the EKS node group"
  type        = list(string)
  default     = ["m5.large"]
}

variable "min_size" {
  description = "Minimum size of the node group"
  type        = number
  default     = 3
}

variable "max_size" {
  description = "Maximum size of the node group"
  type        = number
  default     = 6
}

variable "desired_size" {
  description = "Desired size of the node group"
  type        = number
  default     = 3
}
