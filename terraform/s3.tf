# =============================================
# S3 Bucket for Frontend Static Website Hosting
# The React build output (dist/) is deployed here.
# Configured with public read access for website visitors.
# =============================================

resource "aws_s3_bucket" "frontend" {
  bucket = var.s3_bucket_name

  tags = {
    Name    = "codereview-frontend"
    Project = "DecentralisedPeerCodeReview"
  }
}

# Enable static website hosting with SPA routing support
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  # Route all 404s to index.html for React Router client-side routing
  error_document {
    key = "index.html"
  }
}

# Allow public access for static website hosting
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Bucket policy granting public read access to all objects
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.frontend]
}
