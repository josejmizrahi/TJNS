output "primary_endpoint" {
  description = "The primary endpoint of the Redis replication group"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "security_group_id" {
  description = "The security group ID for the Redis cluster"
  value       = aws_security_group.redis.id
}
