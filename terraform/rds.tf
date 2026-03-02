# =============================================
# RDS PostgreSQL Configuration
# Database instance in private subnets, accessible only from EC2.
# =============================================

resource "aws_db_subnet_group" "main" {
  name       = "codereview-db-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = {
    Name = "codereview-db-subnet-group"
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "codereview-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  # PostgreSQL access only from EC2
  ingress {
    description     = "PostgreSQL from EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
  }

  tags = {
    Name = "codereview-rds-sg"
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "codereview-db"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = var.db_instance_class
  allocated_storage      = 20
  max_allocated_storage  = 50
  storage_type           = "gp3"
  db_name                = "codereview_db"
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  publicly_accessible    = false
  skip_final_snapshot    = true
  multi_az               = false

  tags = {
    Name    = "codereview-postgres"
    Project = "DecentralisedPeerCodeReview"
  }
}
