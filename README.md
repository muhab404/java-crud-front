# Java CRUD Application

A simple Java application that performs CRUD operations on a PostgreSQL database.

## Features

- **Create** new users
- **Read** user by ID or all users
- **Update** existing users
- **Delete** users
- Command-line interface
- PostgreSQL database integration

## Prerequisites

- Java 11 or higher
- Maven 3.6+
- PostgreSQL database
- Access to AWS RDS instance

## Project Structure

```
java-crud-app/
├── src/
│   ├── main/java/com/webapp/
│   │   ├── App.java              # Main application
│   │   ├── User.java             # User model
│   │   ├── UserDAO.java          # Database operations
│   │   └── DatabaseConnection.java # DB connection utility
│   └── test/java/com/webapp/
│       └── UserDAOTest.java      # Unit tests
├── pom.xml                       # Maven configuration
└── README.md                     # This file
```

## Environment Variables

Set these environment variables before running:

```bash
export DB_URL=jdbc:postgresql://your-rds-endpoint:5432/webapp
export DB_USERNAME=dbadmin
export DB_PASSWORD=your-password
```

## Build and Run

### 1. Build the application:
```bash
mvn clean compile
```

### 2. Run tests:
```bash
mvn test
```

### 3. Run the application:
```bash
mvn exec:java -Dexec.mainClass="com.webapp.App"
```

### 4. Package JAR:
```bash
mvn clean package
java -jar target/java-crud-app-1.0.0.jar
```

## Usage

The application provides a menu-driven interface:

```
=== User Management ===
1. Create User
2. Read User
3. Read All Users
4. Update User
5. Delete User
6. Exit
```

### Example Operations:

**Create User:**
- Enter name: John Doe
- Enter email: john@example.com

**Read User:**
- Enter user ID: 1

**Update User:**
- Enter user ID to update: 1
- Enter new name: John Smith
- Enter new email: johnsmith@example.com

## Database Schema

The application creates a `users` table:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);
```

## Testing

Run unit tests with:
```bash
mvn test
```

Tests cover:
- User model creation
- User properties validation
- String representation

## Deployment

The application is designed to run on AWS EC2 instances with access to RDS PostgreSQL.

### Production Deployment:
1. Set environment variables for database connection
2. Build JAR file: `mvn clean package`
3. Transfer JAR to EC2 instance
4. Run: `java -jar java-crud-app-1.0.0.jar`

## CI/CD Pipeline

The project includes GitHub Actions workflow for:
- **DEV**: Deploys on develop branch push
- **TEST**: Deploys after successful DEV deployment
- **STG**: Deploys on master branch (bastion host)

See `.github/workflows/ci-cd.yml` for pipeline configuration.

## Contributing

1. Create feature branch from `develop`
2. Make changes and test locally
3. Create pull request to `develop`
4. After review, merge to `develop`
5. Create pull request from `develop` to `master` for staging deployment

## Error Handling

The application handles:
- Database connection errors
- SQL exceptions
- Invalid user input
- Duplicate email constraints

## Dependencies

- **PostgreSQL JDBC Driver**: Database connectivity
- **JUnit 4**: Unit testing framework
- **Maven**: Build and dependency management