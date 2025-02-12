output "eks_cluster_security_group_rules" {
  description = "Security group rules for EKS cluster"
  value       = aws_security_group_rule.eks_cluster_rules[*].id
}

output "eks_node_security_group_rules" {
  description = "Security group rules for EKS nodes"
  value       = aws_security_group_rule.eks_node_rules[*].id
}

output "rds_security_group_rules" {
  description = "Security group rules for RDS"
  value       = aws_security_group_rule.rds_rules[*].id
}

output "redis_security_group_rules" {
  description = "Security group rules for Redis"
  value       = aws_security_group_rule.redis_rules[*].id
}
