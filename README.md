# 🛒 Grocito – Fast-Track Grocery Delivery System

> 🚀 A real-time, location-based grocery delivery web application inspired by Blinkit, built by **Team Code2Cart**.

---

## 📌 Project Overview

**Grocito** is a full-stack grocery delivery platform that enables users to seamlessly browse, order, and track groceries in real-time based on their location. The system implements **role-based access control** (User, Admin, Delivery Partner), and intelligently manages **location-specific inventory** using pincode mapping.

Inspired by Blinkit, Grocito includes essential features such as product discovery, cart management, checkout, and delivery tracking—while also introducing innovative add-ons like smart suggestions, analytics, and instant checkout.

---

## ✨ Key Features

### 👤 User

- Location-based onboarding (pincode check)
- Browse and search products
- Smart cart management
- Place and track orders in real-time
- View past orders and download invoices
- Wishlist and reordering functionality

### 🛠️ Admin

- Manage products and inventory by pincode/warehouse
- View, update, and cancel orders
- Assign delivery agents
- Analytics dashboard (sales, top items, users, etc.)

### 🚚 Delivery Partner

- View assigned orders
- Update delivery status
- Simulate real-time location updates

---

## 🏗️ Tech Stack

| Layer              | Technology             |
| ------------------ | ---------------------- |
| **Frontend**       | React.js, Tailwind CSS |
| **Backend**        | Java, Spring Boot      |
| **Database**       | MySQL                  |
| **Authentication** | JWT, Spring Security   |
| **API Format**     | RESTful APIs           |
| **Tools**          | Postman, Git, GitHub   |

---

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.6+

### Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/YOUR_USERNAME/Grocito-Copy.git
   cd Grocito-Copy
   ```

2. **Backend Setup:**

   ```bash
   # Configure database credentials
   cp src/main/resources/application-secrets.properties.template src/main/resources/application-secrets.properties

   # Edit the file with your MySQL credentials
   # Create database: CREATE DATABASE grocito_db;

   # Run backend
   ./mvnw spring-boot:run
   ```

3. **Frontend Setup:**

   ```bash
   # Admin Panel
   cd grocito-frontend-admin
   npm install
   npm start

   # Customer App (in new terminal)
   cd grocito-frontend/frontend
   npm install
   npm start

   # Delivery Partner App (in new terminal)
   cd grocito-frontend-delivery-partner
   npm install
   npm start
   ```

4. **Access Applications:**
   - Backend API: http://localhost:8080
   - Customer App: http://localhost:3000
   - Admin Panel: http://localhost:3001
   - Delivery Partner: http://localhost:3002

---
