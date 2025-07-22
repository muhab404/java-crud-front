# Docker Containerization Guide

## Overview
This guide explains how to containerize the Java CRUD application using Docker and Docker Compose.

## Prerequisites
- Docker installed
- Docker Compose installed
- Java 11 and Maven (for building)

## Files Created
- `Dockerfile` - Container definition for the Java application
- `docker-compose.yml` - Local development setup
- `docker-compose.prod.yml` - Production setup with ECR images
- `.dockerignore` - Files to exclude from Docker build

## Building the Application

### 1. Build the JAR file
```bash
mvn clean package -DskipTests
```

### 2. Build Docker Image
```bash
docker build -t java-crud-app .
```

## Running with Docker Compose

### Local Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production (with ECR images)
```bash
# Set environment variables
export ECR_REGISTRY=your-account-id.dkr.ecr.region.amazonaws.com
export ECR_REPOSITORY=java-crud-app
export IMAGE_TAG=latest

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

## Services
- **java-app**: Spring Boot application (port 8080)
- **postgres**: PostgreSQL database (port 5432)

## Environment Variables
- `DB_URL`: Database connection URL
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password

## Accessing the Application
- Application: http://localhost:8080
- Database: localhost:5432

## Troubleshooting
- Check logs: `docker-compose logs [service-name]`
- Rebuild: `docker-compose up --build`
- Clean up: `docker-compose down -v` (removes volumes)