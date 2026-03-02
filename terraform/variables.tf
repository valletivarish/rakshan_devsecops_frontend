# =============================================
# Input Variables for Frontend Terraform Configuration
# =============================================

variable "aws_region" {
  description = "AWS region for resource provisioning"
  type        = string
  default     = "eu-west-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance"
  type        = string
  default     = "ami-0c1c30571d2dae5c9"
}

variable "key_pair_name" {
  description = "EC2 key pair name for SSH access"
  type        = string
  default     = "codereview-keypair"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "s3_bucket_name" {
  description = "S3 bucket name for frontend hosting"
  type        = string
  default     = "codereview-frontend-rakshan"
}
