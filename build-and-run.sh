#!/bin/bash

echo "Building Java CRUD Application..."

# Build the application
echo "Step 1: Building JAR file..."
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo "✅ JAR build successful"
else
    echo "❌ JAR build failed"
    exit 1
fi

# Build Docker image
echo "Step 2: Building Docker image..."
docker build -t java-crud-app .

if [ $? -eq 0 ]; then
    echo "✅ Docker image build successful"
else
    echo "❌ Docker image build failed"
    exit 1
fi

# Start services with Docker Compose
echo "Step 3: Starting services with Docker Compose..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ Services started successfully"
    echo "🌐 Application available at: http://localhost:8080"
    echo "🗄️ Database available at: localhost:5432"
else
    echo "❌ Failed to start services"
    exit 1
fi

echo "📋 To view logs: docker-compose logs -f"
echo "🛑 To stop services: docker-compose down"