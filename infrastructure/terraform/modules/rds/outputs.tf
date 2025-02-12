output "endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.main.endpoint
}

output "db_name" {
  description = "The name of the default database"
  value       = aws_db_instance.main.db_name
}

output "security_group_id" {
  description = "The security group ID for the RDS instance"
  value       = aws_security_group.rds.id
}

output "subnet_group_name" {
  description = "The name of the DB subnet group"
  value       = aws_db_subnet_group.main.name
}

output "arn" {
  description = "The ARN of the RDS instance"
  value       = aws_db_instance.main.arn
}
