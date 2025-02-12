# Security group for Redis
resource "aws_security_group" "redis" {
  name        = "tjns-${var.environment}-redis-sg"
  description = "Security group for Redis cluster"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [] # Will be updated when EKS security group is available
  }

  tags = {
    Name = "tjns-${var.environment}-redis-sg"
  }
}

# Redis subnet group
resource "aws_elasticache_subnet_group" "main" {
  name        = "tjns-${var.environment}-redis-subnet"
  description = "Redis subnet group for ElastiCache"
  subnet_ids  = var.subnet_ids
}

# KMS key for Redis encryption
resource "aws_kms_key" "redis" {
  description             = "KMS key for Redis encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "tjns-${var.environment}-redis-key"
  }
}

# Redis parameter group
resource "aws_elasticache_parameter_group" "main" {
  family = "redis6.x"
  name   = "tjns-${var.environment}-redis-params"

  parameter {
    name  = "maxmemory-policy"
    value = "volatile-lru"
  }
}

# Redis replication group
resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "tjns-${var.environment}-redis"
  description          = "Redis replication group for TJNS"
  node_type            = var.node_type
  port                 = 6379

  num_cache_clusters         = var.num_cache_clusters
  automatic_failover_enabled = true
  multi_az_enabled           = true

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  parameter_group_name = aws_elasticache_parameter_group.main.name

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  kms_key_id                 = aws_kms_key.redis.arn

  snapshot_retention_limit = var.snapshot_retention_limit
  snapshot_window          = var.snapshot_window
  maintenance_window       = var.maintenance_window

  tags = {
    Name = "tjns-${var.environment}-redis"
  }
}
