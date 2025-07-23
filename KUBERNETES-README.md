# Kubernetes Deployment Guide

Complete Kubernetes deployment solution for Java CRUD Frontend Application with PostgreSQL database, including manifests, scaling, and production-ready configurations.

## Kubernetes Components

### 1. Namespace

### 2. Application Deployment

### 3. Database StatefulSet

### 4. Services

### 5. Secrets Management

## Manifest Files Overview

```
k8s/
├── namespace.yaml              # Namespace definition
├── postgres-secret.yaml        # Database credentials
├── postgres-pv.yml            # Persistent Volume
├── postgres-pvc.yaml          # Persistent Volume Claim
├── postgres-deployment.yaml   # PostgreSQL StatefulSet
└── app-deployment.yaml        # Application Deployment
```

## Detailed Manifest Analysis

### 1. Namespace Configuration
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: java-crud-app
```

**Purpose:**
- Resource isolation
- Security boundary
- Resource quotas
- Network policies

### 2. Secret Management
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: java-crud-app
type: Opaque
data:
  postgres-db: d2ViYXBw         
  postgres-user: ZGJhZG1pbg==   
  postgres-password: Q2hhbmdlTWUxMjMh
```

**Security Features:**
- Base64 encoding (not encryption)
- Namespace-scoped access
- Environment variable injection
- Secret rotation support

### 3. Persistent Storage
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
```

**Storage Features:**
- 1GB capacity
- ReadWriteOnce access mode
- Retain reclaim policy
- Manual storage class

### 4. PostgreSQL StatefulSet
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: java-crud-app
spec:
  serviceName: "postgres"
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    spec:
      containers:
      - name: postgres
        image: postgres:13
        env:
        - name: POSTGRES_DB
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: postgres-db
```

**StatefulSet Benefits:**
- Stable network identity
- Ordered deployment/scaling
- Persistent storage
- Predictable pod names

### 5. Application Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: java-crud-app-deployment
  namespace: java-crud-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: java-crud-app
  template:
    spec:
      containers:
      - name: java-crud-app
        image: public.ecr.aws/q4a0k8k4/java-crud-app:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

**Deployment Features:**
- 2 replicas for high availability
- ECR image integration
- Resource requests and limits
- Rolling update strategy

## Deployment Instructions

### Prerequisites
- **Kubernetes Cluster**: v1.20+ (EKS, GKE, AKS, or local)
- **kubectl**: Configured with cluster access
- **Docker Images**: Available in ECR registry
- **Storage**: Persistent volume support

### 1. Cluster Setup Verification
```bash
# Verify cluster connection
kubectl cluster-info

```

### 2. Deploy Application Stack
```bash
# Clone repository and switch to docker branch
git clone <repository-url>
cd java-crud-front
git checkout docker

# Navigate to Kubernetes manifests
cd k8s

# Deploy in order (dependencies first)
kubectl apply -f namespace.yaml
kubectl apply -f postgres-secret.yaml
kubectl apply -f postgres-pv.yml
kubectl apply -f postgres-pvc.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f app-deployment.yaml
```

### 3. Verify Deployment
```bash
# Check namespace resources
kubectl get all -n java-crud-app

# Verify pod status
kubectl get pods -n java-crud-app -w

# Check persistent volumes
kubectl get pv,pvc -n java-crud-app

# View service endpoints
kubectl get svc -n java-crud-app
```

### 4. Access Application
```bash
# Port forward to access application
kubectl port-forward -n java-crud-app svc/java-crud-app-service 8080:80

# Test application
curl http://localhost:8080/api/users

```