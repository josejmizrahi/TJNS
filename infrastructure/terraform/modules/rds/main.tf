# Security group for RDS
resource "aws_security_group" "rds" {
  name        = "tjns-${var.environment}-rds-sg"
  description = "Security group for RDS instance"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = []  # Will be updated when EKS security group is available
  }

  tags = {
    Name = "tjns-${var.environment}-rds-sg"
  }
}

# DB subnet group
resource "aws_db_subnet_group" "main" {
  name        = "tjns-${var.environment}-db-subnet"
  description = "DB subnet group for RDS"
  subnet_ids  = var.subnet_ids

  tags = {
    Name = "tjns-${var.environment}-db-subnet"
  }
}

# KMS key for RDS encryption
resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "tjns-${var.environment}-rds-key"
  }
}

# RDS instance
resource "aws_db_instance" "main" {
  identifier        = "tjns-${var.environment}-db"
  engine            = "postgres"
  engine_version    = "14"
  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage
  storage_type      = "gp3"

  db_name  = "tjns_${var.environment}"
  username = "tjns_admin"
  password = random_password.db_password.result

  multi_az               = true
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window

  storage_encrypted = true
  kms_key_id       = aws_kms_key.rds.arn

  skip_final_snapshot = var.environment != "prod"

  tags = {
    Name = "tjns-${var.environment}-db"
  }
}

# Generate random password for RDS
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# Store password in AWS Secrets Manager
resource "aws_secretsmanager_secret" "rds_password" {
  name        = "tjns/${var.environment}/rds/password"
  description = "RDS master password for ${var.environment} environment"
  kms_key_id  = aws_kms_key.rds.arn
}

resource "aws_secretsmanager_secret_version" "rds_password" {
  secret_id     = aws_secretsmanager_secret.rds_password.id
  secret_string = random_password.db_password.result
}
