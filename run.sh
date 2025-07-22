#!/bin/bash

# Load environment variables
source /home/ec2-user/app/env.sh

# Run the Java application
cd /home/ec2-user/app
java -jar target/java-crud-app-1.0.0.jar