# AWS ECR Deployment Guide

Automated Docker image building, pushing to Amazon Elastic Container Registry (ECR), and deployment to EC2 instances via GitHub Actions CI/CD pipeline.

## ECR Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub        │    │   Amazon ECR    │    │   EC2 Instance  │
│   Actions       │───►│   Registry      │───►│   (via Bastion) │
│   (Build)       │    │   (Store)       │    │   (Deploy)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Pipeline Components

### 1. Change Detection System
- **Smart Building**: Only builds when Docker-related files change
- **File Monitoring**: Tracks Dockerfile, docker-compose files, and source code
- **Optimization**: Skips unnecessary builds to save resources

### 2. ECR Integration
- **Public Registry**: `public.ecr.aws/q4a0k8k4/java-crud-app`
- **Multi-Tag Strategy**: SHA-based and latest tags
- **Automated Push**: Direct integration with GitHub Actions

### 3. Secure Deployment
- **Bastion Host**: Secure access through jump server
- **Private EC2**: Application deployed in private subnet
- **SSH Tunneling**: ProxyJump configuration for security

## Workflow Configuration

### Trigger Events
```yaml
on:
  pull_request:
    branches: [ docker ]
```

### Environment Variables
```yaml
env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: public.ecr.aws/q4a0k8k4
  ECR_REPOSITORY: java-crud-app
```

## Pipeline Stages

### Stage 1: Change Detection
**Purpose**: Optimize build process by detecting relevant changes

#### Change Detection Logic
```bash
# Files monitored for changes:
- Dockerfile
- docker-compose*.yml
- .dockerignore
- src/ directory (application code)
```

#### Implementation
```yaml
- name: Detect changes in Docker-related files
  run: |
    git diff --name-only HEAD^ HEAD > changed_files.txt
    if grep -qE '(^Dockerfile|docker-compose.*\.yml|\.dockerignore|^src/)' changed_files.txt; then
      echo "docker-changed=true" >> $GITHUB_OUTPUT
    else
      echo "docker-changed=false" >> $GITHUB_OUTPUT
    fi
```

**Benefits:**
- Reduces unnecessary builds
- Saves CI/CD minutes
- Faster pipeline execution
- Resource optimization

### Stage 2: Build and Push to ECR
**Dependencies**: Change detection  
**Condition**: Only runs when Docker-related changes detected

#### AWS Authentication
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v2
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ env.AWS_REGION }}
```

#### ECR Login
```yaml
- name: Login to Amazon ECR
  uses: aws-actions/amazon-ecr-login@v1
  with:
    registry-type: public
```

#### Build and Push Process
```yaml
- name: Build, tag, and push image to Amazon ECR
  env:
    IMAGE_TAG: ${{ github.sha }}
  run: |
    docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
    docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
```

**Image Tagging Strategy:**
- **SHA Tag**: `${{ github.sha }}` for version tracking
- **Latest Tag**: `latest` for current stable version
- **Immutable Tags**: SHA-based tags never change
- **Rollback Support**: Previous versions always available

### Stage 3: Deployment to EC2
**Dependencies**: Successful ECR push  
**Target**: Private EC2 instance via bastion host

#### SSH Configuration
```yaml
- name: Set up SSH key for Bastion
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/bastion.pem
    chmod 600 ~/.ssh/*.pem
    
    cat <<EOF > ~/.ssh/config
    Host bastion
      HostName ${{ secrets.BASTION_HOST }}
      User ec2-user
      IdentityFile ~/.ssh/bastion.pem
      StrictHostKeyChecking no
    
    Host target
      HostName ${{ secrets.PRIVATE_EC2_HOST }}
      User ec2-user
      IdentityFile ~/.ssh/target.pem
      ProxyJump bastion
      StrictHostKeyChecking no
    EOF
```

#### Deployment Process
```bash
# 1. Clone/Update Repository
cd /home/ec2-user
if [ -d java-crud-app ]; then
  cd java-crud-app && git checkout docker && git pull origin docker
else
  git clone --branch docker https://github.com/repo.git java-crud-app
fi

# 2. Configure Environment
echo "ECR_REGISTRY=public.ecr.aws/q4a0k8k4" > .env
echo "ECR_REPOSITORY=java-crud-app" >> .env
echo "IMAGE_TAG=latest" >> .env

# 3. Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --remove-orphans
```

## Required Secrets Configuration

### AWS Credentials
```bash
# AWS Access Configuration
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Required IAM Permissions:
- ecr-public:GetAuthorizationToken
- ecr-public:BatchCheckLayerAvailability
- ecr-public:GetDownloadUrlForLayer
- ecr-public:BatchGetImage
- ecr-public:InitiateLayerUpload
- ecr-public:UploadLayerPart
- ecr-public:CompleteLayerUpload
- ecr-public:PutImage
```

### SSH Configuration
```bash
# Bastion Host Access
BASTION_HOST=54.123.45.67
PRIVATE_EC2_HOST=10.0.2.100

# SSH Private Key (full content)
SSH_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...full private key content...
-----END RSA PRIVATE KEY-----
```

## ECR Repository Setup

### Create ECR Repository
```bash
# Create public ECR repository
aws ecr-public create-repository \
    --repository-name java-crud-app \
    --region us-east-1

# Get repository URI
aws ecr-public describe-repositories \
    --repository-names java-crud-app \
    --region us-east-1
```




### Security Groups
```bash
# Bastion Host Security Group
- SSH (22) from 0.0.0.0/0
- HTTPS (443) outbound

# Application Security Group  
- SSH (22) from Bastion SG
- HTTP (8080) from ALB SG
- PostgreSQL (5432) to RDS SG

# RDS Security Group
- PostgreSQL (5432) from Application SG
```
