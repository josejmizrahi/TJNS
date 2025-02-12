# Security group rules for EKS cluster
resource "aws_security_group_rule" "eks_cluster_rules" {
  count = 2

  security_group_id = var.eks_cluster_security_group_id
  type              = count.index == 0 ? "ingress" : "egress"

  from_port = count.index == 0 ? 443 : 1025
  to_port   = count.index == 0 ? 443 : 65535
  protocol  = "tcp"

  source_security_group_id = var.eks_node_security_group_id
}

# Security group rules for EKS nodes
resource "aws_security_group_rule" "eks_node_rules" {
  count = 3

  security_group_id = var.eks_node_security_group_id
  type              = "ingress"

  from_port = count.index == 0 ? 0 : (count.index == 1 ? 1025 : 443)
  to_port   = count.index == 0 ? 65535 : (count.index == 1 ? 65535 : 443)
  protocol  = "tcp"

  source_security_group_id = count.index == 0 ? var.eks_node_security_group_id : var.eks_cluster_security_group_id
}

# Security group rules for RDS
resource "aws_security_group_rule" "rds_rules" {
  security_group_id        = var.rds_security_group_id
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = var.eks_node_security_group_id
}

# Security group rules for Redis
resource "aws_security_group_rule" "redis_rules" {
  security_group_id        = var.redis_security_group_id
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  source_security_group_id = var.eks_node_security_group_id
}

# KMS key policy for cross-service encryption
data "aws_iam_policy_document" "kms_policy" {
  statement {
    sid    = "Enable IAM User Permissions"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
    actions   = ["kms:*"]
    resources = ["*"]
  }

  statement {
    sid    = "Allow EKS to use the key"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["eks.amazonaws.com"]
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]
  }
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}
