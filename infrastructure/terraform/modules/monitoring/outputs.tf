output "log_group_name" {
  description = "Name of the CloudWatch log group for EKS"
  value       = aws_cloudwatch_log_group.eks.name
}

output "metric_alarms" {
  description = "List of CloudWatch metric alarm ARNs"
  value = concat(
    aws_cloudwatch_metric_alarm.eks_cpu[*].arn,
    aws_cloudwatch_metric_alarm.rds_cpu[*].arn,
    aws_cloudwatch_metric_alarm.redis_cpu[*].arn
  )
}

output "dashboard_name" {
  description = "Name of the CloudWatch dashboard"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}
