# Kubernetes Deployment Guide

## Overview
This guide explains how to deploy the Java CRUD application on a Kubernetes cluster.

## Prerequisites
- Kubernetes cluster access
- kubectl configured
- ECR repository with application image

## Kubernetes Files
- `k8s/namespace.yaml` - Application namespace
- `k8s/postgres-secret.yaml` - Database credentials
- `k8s/postgres-pvc.yaml` - Persistent storage for database
- `k8s/postgres-deployment.yaml` - PostgreSQL deployment and service
- `k8s/app-deployment.yaml` - Java application deployment and service

## Deployment Steps

### 1. Create Namespace
```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. Create Secrets
```bash
kubectl apply -f k8s/postgres-secret.yaml
```

### 3. Create Persistent Volume
```bash
kubectl apply -f k8s/postgres-pvc.yaml
```

### 4. Deploy PostgreSQL
```bash
kubectl apply -f k8s/postgres-deployment.yaml
```

### 5. Update Application Image
Edit `k8s/app-deployment.yaml` and replace `<ECR_REGISTRY>` with your ECR registry URL:
```yaml
image: your-account-id.dkr.ecr.region.amazonaws.com/java-crud-app:latest
```

### 6. Deploy Application
```bash
kubectl apply -f k8s/app-deployment.yaml
```

## Verification

### Check Deployments
```bash
kubectl get deployments -n java-crud-app
kubectl get pods -n java-crud-app
kubectl get services -n java-crud-app
```

### Check Logs
```bash
kubectl logs -f deployment/java-crud-app-deployment -n java-crud-app
kubectl logs -f deployment/postgres-deployment -n java-crud-app
```

### Access Application
```bash
# Get external IP (if LoadBalancer)
kubectl get service java-crud-app-service -n java-crud-app

# Port forward for testing
kubectl port-forward service/java-crud-app-service 8080:80 -n java-crud-app
```

## Scaling

### Scale Application
```bash
kubectl scale deployment java-crud-app-deployment --replicas=3 -n java-crud-app
```

## Configuration

### Database Credentials
Stored in `postgres-secret` (base64 encoded):
- Database: webapp
- Username: dbadmin
- Password: ChangeMe123!

### Resource Limits
Application pods have:
- Memory: 512Mi request, 1Gi limit
- CPU: 250m request, 500m limit

## Troubleshooting

### Common Issues
1. **Image Pull Errors**: Ensure ECR image URL is correct
2. **Database Connection**: Check if PostgreSQL pod is running
3. **Storage Issues**: Verify PVC is bound

### Debug Commands
```bash
# Describe resources
kubectl describe pod <pod-name> -n java-crud-app
kubectl describe service <service-name> -n java-crud-app

# Check events
kubectl get events -n java-crud-app --sort-by='.lastTimestamp'
```

## Cleanup
```bash
kubectl delete namespace java-crud-app
```