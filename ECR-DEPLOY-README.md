# ECR Deployment Guide

## Overview
This guide explains how to build, push Docker images to Amazon ECR, and deploy using GitHub Actions.

## Prerequisites
- AWS Account with ECR repository created
- GitHub repository with secrets configured
- Docker installed locally

## GitHub Secrets Required
Configure these secrets in your GitHub repository:
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key

## ECR Setup

### 1. Create ECR Repository
```bash
aws ecr create-repository --repository-name java-crud-app --region us-east-1
```

### 2. Get Login Token
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

## GitHub Actions Workflow

The workflow file `.github/workflows/docker-ecr-deploy.yml` handles:

### Build Stage
1. Checkout code
2. Set up JDK 11
3. Cache Maven dependencies
4. Build JAR with Maven
5. Configure AWS credentials
6. Login to ECR
7. Build and push Docker images

### Deploy Stage
1. Configure AWS credentials
2. Login to ECR
3. Deploy to server using Docker Compose

## Manual ECR Operations

### Build and Push
```bash
# Build the application
mvn clean package -DskipTests

# Build Docker image
docker build -t java-crud-app .

# Tag for ECR
docker tag java-crud-app:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/java-crud-app:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/java-crud-app:latest
```

### Deploy on Server
```bash
# Set environment variables
export ECR_REGISTRY=<account-id>.dkr.ecr.us-east-1.amazonaws.com
export ECR_REPOSITORY=java-crud-app
export IMAGE_TAG=latest

# Login to ECR on server
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY

# Deploy with production compose file
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables
- `ECR_REGISTRY`: ECR registry URL
- `ECR_REPOSITORY`: Repository name
- `IMAGE_TAG`: Image tag (default: latest)

## Monitoring
- Check GitHub Actions for build status
- Monitor ECR repository for new images
- Verify deployment on target server