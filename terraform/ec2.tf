# =============================================
# EC2 Instance Configuration
# Provisions a t2.micro instance for hosting the Spring Boot backend.
# Included in the frontend Terraform for complete infrastructure reference.
# =============================================

# Security group for the backend EC2 instance
resource "aws_security_group" "ec2_sg" {
  name        = "codereview-ec2-sg"
  description = "Security group for the backend EC2 instance"
  vpc_id      = aws_vpc.main.id

  # SSH access for CI/CD deployment
  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Spring Boot application port
  ingress {
    description = "Application port"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "codereview-ec2-sg"
  }
}

# EC2 instance with Java 17 for running the backend
resource "aws_instance" "backend" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              sudo yum update -y
              sudo yum install -y java-17-amazon-corretto-devel
              mkdir -p /home/ec2-user/app
              cat > /etc/systemd/system/codereview.service <<'SERVICE'
              [Unit]
              Description=Code Review Platform Backend
              After=network.target
              [Service]
              User=ec2-user
              ExecStart=/usr/bin/java -jar /home/ec2-user/app/codereview-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
              Restart=always
              RestartSec=10
              [Install]
              WantedBy=multi-user.target
              SERVICE
              sudo systemctl daemon-reload
              sudo systemctl enable codereview
              EOF

  tags = {
    Name    = "codereview-backend"
    Project = "DecentralisedPeerCodeReview"
  }
}
