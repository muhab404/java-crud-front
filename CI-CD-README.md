# CI/CD Pipeline Documentation

This document describes the GitHub Actions CI/CD pipeline for the Java CRUD application.

## Pipeline Overview

The pipeline supports three environments:
- **DEV**: Development environment (develop branch)
- **TEST**: Testing environment (after DEV success)
- **STG**: Staging environment (master branch, bastion host)

## Workflow Triggers

```yaml
on:
  push:
    branches: [ develop, master ]
  pull_request:
    branches: [ develop, master ]
```

## Pipeline Stages

### 1. Test Stage
- **Trigger**: All pushes and PRs
- **Actions**: 
  - Checkout code
  - Setup JDK 11
  - Run `mvn clean test`
- **Purpose**: Validate code quality

### 2. Deploy to DEV
- **Trigger**: Push to `develop` branch
- **Dependencies**: Test stage success
- **Actions**:
  - Build application (`mvn clean package`)
  - Set DEV environment variables
  - Deploy to DEV environment

### 3. Deploy to TEST
- **Trigger**: After successful DEV deployment
- **Dependencies**: DEV deployment success
- **Actions**:
  - Build application
  - Set TEST environment variables
  - Deploy to TEST environment

### 4. Deploy to STG
- **Trigger**: Push to `master` branch only
- **Dependencies**: Test stage success
- **Actions**:
  - Build application
  - Deploy to AWS EC2 bastion host via SSH
  - Upload JAR file to production server

## Required Secrets

Configure these secrets in GitHub repository settings:

### Database Secrets
```
DB_USERNAME=dbadmin
DB_PASSWORD=your-secure-password
DEV_DB_HOST=dev-rds-endpoint.amazonaws.com
TEST_DB_HOST=test-rds-endpoint.amazonaws.com
STG_DB_HOST=staging-rds-endpoint.amazonaws.com
```

### SSH Secrets (for STG deployment)
```
BASTION_HOST=your-bastion-public-ip
SSH_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
...your private key content...
-----END RSA PRIVATE KEY-----
```

## Environment Configuration

### DEV Environment
- **Branch**: `develop`
- **Database**: Development RDS instance
- **Deployment**: Simulated deployment with environment setup

### TEST Environment
- **Branch**: `develop` (after DEV success)
- **Database**: Test RDS instance
- **Deployment**: Automated testing environment

### STG Environment
- **Branch**: `master` only
- **Database**: Production RDS instance
- **Deployment**: AWS EC2 bastion host via SSH

## Branch Protection Rules

### Master Branch Protection
1. Go to GitHub repository → Settings → Branches
2. Add rule for `master` branch:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Restrict pushes that create files larger than 100MB
   - ✅ Restrict who can push to matching branches (Owners only)

### Required Status Checks
- `test` job must pass
- All conversations must be resolved

## Deployment Process

### For Feature Development:
1. Create feature branch from `develop`
2. Make changes and push
3. Create PR to `develop`
4. After approval, merge triggers DEV → TEST deployment

### For Production Release:
1. Create PR from `develop` to `master`
2. After approval and merge, triggers STG deployment
3. Application deployed to bastion host

## Pipeline Files

### Main Workflow: `.github/workflows/ci-cd.yml`
- Defines all jobs and environments
- Handles conditional deployments
- Manages secrets and environment variables

## Monitoring and Logs

### GitHub Actions Logs
- View pipeline execution in GitHub Actions tab
- Check individual job logs for debugging
- Monitor deployment status and errors

### Application Logs
- SSH to bastion host to check application logs
- Monitor database connections and errors
- Check Java application output

## Troubleshooting

### Common Issues:

**1. Test Failures**
```bash
# Run tests locally
mvn clean test
# Check test reports in target/surefire-reports/
```

**2. SSH Connection Issues**
- Verify bastion host IP in secrets
- Check SSH private key format
- Ensure security groups allow SSH access

**3. Database Connection Issues**
- Verify RDS endpoints in secrets
- Check security groups allow database access
- Validate database credentials

**4. Build Failures**
```bash
# Local build test
mvn clean compile
mvn clean package
```

## Security Best Practices

1. **Secrets Management**:
   - Never commit secrets to repository
   - Use GitHub Secrets for sensitive data
   - Rotate SSH keys regularly

2. **Branch Protection**:
   - Master branch requires PR reviews
   - Only owners can merge to master
   - Status checks must pass

3. **Environment Isolation**:
   - Separate databases for each environment
   - Different access credentials per environment
   - Isolated deployment targets

## Maintenance

### Regular Tasks:
- Update dependencies in `pom.xml`
- Rotate SSH keys and database passwords
- Monitor pipeline performance
- Review and update branch protection rules

### Scaling Considerations:
- Add more test environments as needed
- Implement blue-green deployments
- Add monitoring and alerting
- Consider containerization with Docker