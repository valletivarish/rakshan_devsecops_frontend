# =============================================
# Terraform Outputs for Frontend Infrastructure
# =============================================

output "ec2_public_ip" {
  description = "Public IP of the backend EC2 instance"
  value       = aws_instance.backend.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the backend EC2 instance"
  value       = aws_instance.backend.public_dns
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_port" {
  description = "RDS PostgreSQL port"
  value       = aws_db_instance.postgres.port
}

output "s3_website_url" {
  description = "S3 static website URL for the frontend"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.frontend.bucket
}
