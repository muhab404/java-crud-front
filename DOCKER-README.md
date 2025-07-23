# Docker Deployment Guide

Complete Docker containerization solution for Java CRUD Frontend Application with PostgreSQL database, supporting both development and production environments.

## Docker Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Docker Environment                      │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Java App      │    │   PostgreSQL    │                │
│  │   Container     │◄─►│   Container     │                │
│  │   Port: 8080    │    │   Port: 5432    │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                        │
│  ┌─────────────────────────────────────────┐               │
│  │         Docker Network                  │               │
│  │         (app-network)                   │               │
│  └─────────────────────────────────────────┘               │
└────────────────────────────────────────────────────────────┘
```

## Container Components

### 1. Java Application Container
- **Base Image**: `openjdk:11-jre-slim`
- **Build Stage**: `maven:3.8.4-openjdk-11`
- **Port**: 8080

### 2. PostgreSQL Database Container
- **Base Image**: `postgres:13`
- **Port**: 5432
- **Persistent Storage**: Docker volumes
- **Configuration**: Environment variables

## File Structure

```
docker-branch/
├── Dockerfile                    # Multi-stage application build
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production environment
├── .dockerignore               # Docker build exclusions
├── build-and-run.sh            # Automated build script
├── .github/workflows/
│   └── docker-ecr-deploy.yml   # ECR deployment pipeline
├── k8s/                        # Kubernetes manifests
│   ├── namespace.yaml
│   ├── app-deployment.yaml
│   ├── postgres-deployment.yaml
│   ├── postgres-secret.yaml
│   ├── postgres-pv.yml
│   └── postgres-pvc.yaml
└── README files for each component
```

## Dockerfile Analysis

### Multi-Stage Build Process

#### Stage 1: Build Stage
```dockerfile
FROM maven:3.8.4-openjdk-11 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests
```

**Benefits:**
- Dependency caching optimization
- Faster subsequent builds
- Clean separation of build and runtime

#### Stage 2: Runtime Stage
```dockerfile
FROM openjdk:11-jre-slim
WORKDIR /app
COPY --from=build /app/target/java-crud-app-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Benefits:**
- Minimal runtime image size
- Optimized for production deployment

## Docker Compose Configurations

### Development Environment (`docker-compose.yml`)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: webapp
      POSTGRES_USER: dbadmin
      POSTGRES_PASSWORD: ChangeMe123!
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  java-app:
    build: .
    environment:
      DB_URL: jdbc:postgresql://postgres:5432/webapp
    ports:
      - "8080:8080"
    depends_on:
      - postgres
```

**Features:**
- Local development setup
- Direct port mapping
- Volume persistence
- Service dependencies

### Production Environment (`docker-compose.prod.yml`)

```yaml
version: '3.8'
services:
  java-app:
    image: ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG:-latest}
    environment:
      DB_URL: jdbc:postgresql://postgres:5432/webapp
    ports:
      - "8080:8080"
```

**Features:**
- ECR image registry integration
- Environment variable configuration
- Production-ready settings
- External image references

## Quick Start Guide

### Prerequisites
- **Docker** 20.10+ installed
- **Docker Compose** 2.0+ installed
- **Git** for repository access

### 1. Clone and Setup
```bash
# Clone repository and switch to docker branch
git clone <repository-url>
cd java-crud-front
git checkout docker

# Verify Docker installation
docker --version
docker-compose --version
```

### 2. Development Deployment
```bash
# Build and start all services
./build-and-run.sh

# Or manually:
docker-compose up -d --build

# View logs
docker-compose logs -f

# Access application
curl http://localhost:8080/api/users
```

### 3. Production Deployment
```bash
# Set environment variables
export ECR_REGISTRY=public.ecr.aws/q4a0k8k4
export ECR_REPOSITORY=java-crud-app
export IMAGE_TAG=latest

# Deploy production stack
docker-compose -f docker-compose.prod.yml up -d

# Monitor deployment
docker-compose -f docker-compose.prod.yml logs -f
```

## Container Management

### Build Commands
```bash
# Build application image
docker build -t java-crud-app .

# Build with specific tag
docker build -t java-crud-app:v1.0.0 .

# Build with build arguments
docker build --build-arg MAVEN_OPTS="-Xmx1024m" -t java-crud-app .
```



## Environment Configuration

### Environment Variables

#### Application Configuration
```bash
# Database Connection
DB_URL=jdbc:postgresql://postgres:5432/webapp
DB_USERNAME=dbadmin
DB_PASSWORD=ChangeMe123!

# Spring Boot Configuration
SPRING_PROFILES_ACTIVE=docker
SERVER_PORT=8080

# JVM Configuration
JAVA_OPTS=-Xmx512m -Xms256m
```

#### PostgreSQL Configuration
```bash
# Database Settings
POSTGRES_DB=webapp
POSTGRES_USER=dbadmin
POSTGRES_PASSWORD=ChangeMe123!

# Performance Tuning
POSTGRES_SHARED_BUFFERS=256MB
POSTGRES_MAX_CONNECTIONS=100
```

### Configuration Files

#### .dockerignore
```
target/
.git/
.github/
*.md
.gitignore
docker-compose*.yml
```

#### Environment File (.env)
```bash
# Create .env file for docker-compose
ECR_REGISTRY=public.ecr.aws/q4a0k8k4
ECR_REPOSITORY=java-crud-app
IMAGE_TAG=latest
DB_PASSWORD=SecurePassword123!
```

## Networking

### Docker Network Configuration
```bash
# Create custom network
docker network create app-network

# Connect containers to network
docker run --network app-network java-crud-app

# Inspect network
docker network inspect app-network
```

### Service Discovery
- **Internal Communication**: Container names as hostnames
- **Database Access**: `postgres:5432` from application
- **External Access**: `localhost:8080` for web interface


## CI/CD Integration

The docker branch includes automated CI/CD pipeline for:
- **ECR Integration**: Automatic image building and pushing
- **Change Detection**: Build only when Docker files change
- **Multi-Environment**: Development and production deployments

See [ECR-DEPLOY-README.md](ECR-DEPLOY-README.md) for detailed CI/CD documentation.

## Migration to Kubernetes

For Kubernetes deployment, see [KUBERNETES-README.md](KUBERNETES-README.md) which includes:
- Kubernetes manifests
- Helm charts
- Service mesh integration
- Auto-scaling configuration

---

