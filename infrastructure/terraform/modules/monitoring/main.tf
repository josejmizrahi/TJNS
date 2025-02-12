# EKS CloudWatch Logs
resource "aws_cloudwatch_log_group" "eks" {
  name              = "/aws/eks/${var.eks_cluster_name}/cluster"
  retention_in_days = 90
}

# EKS CPU Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "eks_cpu" {
  alarm_name          = "tjns-${var.environment}-eks-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "node_cpu_utilization"
  namespace           = "ContainerInsights"
  period              = "300"
  statistic           = "Average"
  threshold           = "70"
  alarm_description   = "EKS cluster CPU utilization is too high"
  alarm_actions       = var.alarm_actions

  dimensions = {
    ClusterName = var.eks_cluster_name
  }
}

# RDS CPU Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "tjns-${var.environment}-rds-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "RDS CPU utilization is too high"
  alarm_actions       = var.alarm_actions

  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }
}

# Redis CPU Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "redis_cpu" {
  alarm_name          = "tjns-${var.environment}-redis-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Redis CPU utilization is too high"
  alarm_actions       = var.alarm_actions

  dimensions = {
    CacheClusterId = var.redis_cluster_id
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "tjns-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["ContainerInsights", "node_cpu_utilization", "ClusterName", var.eks_cluster_name],
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", var.rds_instance_id],
            ["AWS/ElastiCache", "CPUUtilization", "CacheClusterId", var.redis_cluster_id]
          ]
          period = 300
          stat   = "Average"
          title  = "CPU Utilization"
        }
      }
    ]
  })
}
