# Grocito

A full-stack grocery delivery platform with real-time order tracking, location-based inventory management, and role-based access control.

## Overview

Grocito is a production-ready grocery delivery system that connects customers with local stores for quick deliveries. The platform supports three user roles: customers, administrators, and delivery partners, each with dedicated interfaces and functionality.

### Core Capabilities

**For Customers**
- Location-based product discovery with pincode validation
- Real-time order tracking and delivery status updates
- Cart management with persistent sessions
- Order history and invoice generation
- Wishlist and quick reorder functionality

**For Administrators**
- Centralized dashboard with sales analytics
- Product and inventory management by location
- Order lifecycle management and assignment
- Delivery partner verification and management
- Revenue and performance reporting

**For Delivery Partners**
- Order queue with priority assignments
- Route optimization and status updates
- Earnings tracking and payout history
- Availability toggle for shift management

## Technology Stack

| Component | Technology |
|-----------|------------|
| Backend API | Java 17, Spring Boot 3.x |
| Frontend Applications | React 18, Tailwind CSS |
| Database | MySQL 8.0 |
| Authentication | JWT with Spring Security |
| Build Tools | Maven, npm |

## Project Structure

```
grocito/
├── backend/                 # Spring Boot REST API
│   ├── src/
│   └── pom.xml
├── frontend/
│   ├── user/               # Customer-facing application
│   ├── admin/              # Administration dashboard
│   └── delivery-partner/   # Delivery partner application
└── infrastructure/         # Deployment configurations
    ├── nginx/
    └── mysql/
```

## Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Getting Started

### Database Setup

```sql
CREATE DATABASE grocito_db;
CREATE USER 'grocito_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON grocito_db.* TO 'grocito_user'@'localhost';
FLUSH PRIVILEGES;
```

### Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create the secrets configuration file:
   ```bash
   cp src/main/resources/application-secrets.properties.template src/main/resources/application-secrets.properties
   ```

3. Update the configuration with your database credentials:
   ```properties
   spring.datasource.username=grocito_user
   spring.datasource.password=your_password
   ```

4. Start the backend server:
   ```bash
   mvn spring-boot:run
   ```

The API will be available at `http://localhost:8080`

### Frontend Setup

Each frontend application runs independently. Open separate terminal windows for each:

**Customer Application**
```bash
cd frontend/user
npm install
npm start
```
Runs on `http://localhost:3000`

**Admin Dashboard**
```bash
cd frontend/admin
npm install
npm start
```
Runs on `http://localhost:3001`

**Delivery Partner Application**
```bash
cd frontend/delivery-partner
npm install
npm start
```
Runs on `http://localhost:3002`

## API Documentation

The backend exposes RESTful endpoints organized by domain:

| Endpoint Group | Base Path | Description |
|---------------|-----------|-------------|
| Authentication | `/api/users` | User registration and login |
| Products | `/api/products` | Product catalog operations |
| Cart | `/api/cart` | Shopping cart management |
| Orders | `/api/orders` | Order placement and tracking |
| Locations | `/api/locations` | Service area validation |
| Admin | `/api/admin` | Administrative operations |
| Delivery | `/api/delivery` | Delivery partner operations |

## Environment Variables

### Backend
Configure in `application-secrets.properties`:
- Database connection credentials
- JWT secret key
- Email service credentials (optional)

### Frontend
Create `.env` files from provided templates:
- `REACT_APP_API_URL` - Backend API base URL
- `REACT_APP_WEATHER_API_KEY` - OpenWeatherMap API key (for location features)

## Development

### Running Tests

**Backend**
```bash
cd backend
mvn test
```

**Frontend**
```bash
cd frontend/user
npm test
```

### Building for Production

**Backend**
```bash
cd backend
mvn clean package -DskipTests
```

**Frontend**
```bash
cd frontend/user
npm run build
```

## Deployment

Docker deployment configurations are available in the `infrastructure/` directory. See the deployment guide for detailed instructions on containerized deployments.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the LICENSE file for details.
