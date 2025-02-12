# TJNS Infrastructure

## AWS Infrastructure Overview

This directory contains the Terraform configurations for deploying the Jewish Network State infrastructure on AWS.

### Core Components

1. Networking (VPC Module)
   - VPC with public, private, and database subnets
   - NAT Gateway for private subnet access
   - Internet Gateway for public access
   - Route tables for traffic management

2. Compute (EKS Module)
   - Managed Kubernetes cluster
   - Node groups for workload management
   - Auto-scaling configuration

3. Database (RDS Module)
   - PostgreSQL instances
   - Subnet groups for high availability
   - Security group configuration

4. Caching (Redis Module)
   - ElastiCache clusters
   - Subnet groups
   - Security configurations

### Security Considerations

- All sensitive services in private subnets
- Network ACLs and security groups
- Encryption at rest for all data stores
- VPC endpoints for AWS services

### Deployment Instructions

1. Prerequisites
   - AWS CLI configured
   - Terraform installed
   - Required AWS permissions

2. Configuration
   ```bash
   # Initialize Terraform
   terraform init

   # Review plan
   terraform plan -var-file=env/dev.tfvars

   # Apply changes
   terraform apply -var-file=env/dev.tfvars
   ```

### IAM Policies

Each service requires specific IAM roles and policies:

1. EKS Cluster Role
   - EC2 management
   - Load balancer configuration
   - AutoScaling management

2. RDS Access Role
   - Database management
   - Backup operations
   - Parameter group modifications

3. Application Roles
   - S3 access for storage
   - SQS/SNS for messaging
   - KMS for encryption

### Monitoring & Logging

- CloudWatch integration
- ELK stack deployment
- Prometheus/Grafana for Kubernetes
