# Grocito Backend API

The Spring Boot REST API powering the Grocito grocery delivery platform.

## Overview

This backend service provides all API endpoints for the Grocito ecosystem, handling authentication, product management, order processing, and delivery operations. Built with Spring Boot 3.x and secured with JWT authentication.

## Features

- RESTful API architecture
- JWT-based authentication with role-based access control
- Product catalog management with location-based inventory
- Order lifecycle management
- Delivery partner assignment and tracking
- Email notifications
- Comprehensive logging

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher

## Installation

1. Create the database:
   ```sql
   CREATE DATABASE grocito_db;
   ```

2. Configure application properties:
   ```bash
   cp src/main/resources/application-secrets.properties.template src/main/resources/application-secrets.properties
   ```

3. Update database credentials in `application-secrets.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/grocito_db
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Authenticate user |
| POST | `/api/users/forgot-password` | Request password reset |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/{id}` | Get product details |
| POST | `/api/products` | Create product (Admin) |
| PUT | `/api/products/{id}` | Update product (Admin) |
| DELETE | `/api/products/{id}` | Delete product (Admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update` | Update cart item |
| DELETE | `/api/cart/remove/{id}` | Remove cart item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List user orders |
| GET | `/api/orders/{id}` | Get order details |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/{id}/status` | Update order status |

### Locations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations/service-check/{pincode}` | Check service availability |
| GET | `/api/locations/suggestions` | Get location suggestions |

## Project Structure

```
src/main/java/com/example/Grocito/
├── Controller/       # REST controllers
├── Entity/           # JPA entities
├── Repository/       # Data repositories
├── Services/         # Business logic
├── config/           # Configuration classes
├── dto/              # Data transfer objects
└── service/          # Additional services
```

## Configuration

### Application Properties

| Property | Description |
|----------|-------------|
| `server.port` | Server port (default: 8080) |
| `spring.datasource.*` | Database connection settings |
| `jwt.secret` | JWT signing key |
| `jwt.expiration` | Token expiration time |

### Profiles

- `default` - Development configuration
- `local` - Local development with debug logging
- `prod` - Production configuration

## Running Tests

```bash
mvn test
```

## Building for Production

```bash
mvn clean package -DskipTests
```

The JAR file will be created in the `target/` directory.

## Running the JAR

```bash
java -jar target/grocito-0.0.1-SNAPSHOT.jar
```

## Database Migrations

Database schema is managed through JPA with `spring.jpa.hibernate.ddl-auto` property. For production, consider using Flyway or Liquibase for version-controlled migrations.
