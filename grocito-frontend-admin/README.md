# 👨‍💼 Grocito Admin Portal

> 🚀 A comprehensive admin dashboard for managing the Grocito grocery delivery platform.

---

## 📌 Overview

The **Grocito Admin Portal** is a separate React TypeScript application designed specifically for administrators to manage users, orders, products, and analytics for the Grocito grocery delivery system.

## ✨ Key Features

### 🔐 **Enhanced Role-Based Authentication**
- ✅ Admin-only access with role validation
- ✅ Secure token-based authentication
- ✅ Automatic redirection for non-admin users
- ✅ Session management with auto-logout

### 📊 **Dashboard Analytics**
- 📈 Real-time statistics (users, orders, revenue)
- 📊 Quick action buttons for common tasks
- 🔔 Recent activity feed
- 📍 Performance metrics

### 👥 **User Management** (Coming Soon)
- View all users with advanced filtering
- Edit user roles and details
- Suspend/activate accounts
- User activity analytics

### 📦 **Order Management** (Coming Soon)
- View all orders with status tracking
- Update order status
- Assign delivery partners
- Order analytics and reports

### 🛍️ **Product Management** (Coming Soon)
- Add/edit/delete products
- Inventory management by pincode
- Category management
- Price management

---

## 🏗️ **Architecture**

```
📁 grocito-frontend-admin/
├── 🔐 src/api/                 (API services)
│   ├── config.ts              (Axios configuration)
│   └── authService.ts         (Admin authentication)
├── 🛡️ src/components/auth/     (Authentication components)
│   ├── AdminRoute.tsx         (Role-based route protection)
│   └── AdminLoginPage.tsx     (Admin login interface)
├── 📊 src/components/dashboard/ (Dashboard components)
│   └── AdminDashboard.tsx     (Main admin dashboard)
└── 🔧 src/components/common/   (Shared components)
    └── LoadingSpinner.tsx     (Loading indicator)
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:8080`

### **Installation**

1. **Navigate to admin directory:**
   ```bash
   cd grocito-frontend-admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # .env file is already configured with:
   REACT_APP_API_BASE_URL=http://localhost:8080/api
   REACT_APP_ADMIN_PORT=3001
   REACT_APP_CUSTOMER_APP_URL=http://localhost:3000
   ```

4. **Start the admin portal:**
   ```bash
   npm start
   ```

5. **Access the admin portal:**
   - URL: `http://localhost:3001`
   - Demo Admin: `admin@grocito.com` / `admin123`

---

## 🔐 **Authentication & Security**

### **Role-Based Access Control**
```typescript
// Only ADMIN role users can access the admin portal
if (user.role !== 'ADMIN') {
  // Access denied - redirect to appropriate portal
}
```

### **Multi-App Architecture**
- 🛒 **Customer App** (`localhost:3000`) - USER role only
- 👨‍💼 **Admin Portal** (`localhost:3001`) - ADMIN role only  
- 🚚 **Delivery App** (`localhost:3002`) - DELIVERY_PARTNER role only

### **Security Features**
- ✅ JWT token validation
- ✅ Role-based route protection
- ✅ Automatic session cleanup
- ✅ Cross-app role validation
- ✅ Secure API interceptors

---

## 🎨 **UI/UX Design**

### **Admin Theme**
- 🎨 **Color Scheme:** Professional gray-blue palette
- 📊 **Layout:** Data-heavy dashboard design
- 🔍 **Focus:** Analytics and management tools
- 📱 **Responsive:** Desktop-first approach

### **Key Design Elements**
- Clean, professional interface
- Rich data tables and charts
- Intuitive navigation
- Real-time status indicators

---

## 🛠️ **Tech Stack**

| Layer           | Technology              |
|----------------|--------------------------|
| **Frontend**    | React 19 + TypeScript   |
| **Styling**     | Tailwind CSS            |
| **Routing**     | React Router v7         |
| **HTTP Client** | Axios                   |
| **Charts**      | Recharts                |
| **Icons**       | Heroicons               |
| **Notifications** | React Toastify        |

---

## 📊 **Available Scripts**

```bash
# Start development server on port 3001
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (not recommended)
npm run eject
```

---

## 🔗 **API Integration**

### **Base Configuration**
```typescript
// API base URL
const API_BASE_URL = 'http://localhost:8080/api'

// Admin-specific endpoints
POST /users/login          // Admin login
GET  /users               // Get all users (admin only)
PUT  /users/{id}/role     // Update user role (admin only)
GET  /orders/all          // Get all orders (admin only)
```

### **Authentication Flow**
1. Admin logs in with credentials
2. Backend validates admin role
3. JWT token stored in `admin_token`
4. All API requests include admin token
5. Role validation on every protected route

---

## 🚧 **Development Roadmap**

### **Phase 1: Foundation** ✅
- [x] Enhanced role-based authentication
- [x] Admin dashboard structure
- [x] Basic analytics display

### **Phase 2: Core Features** 🚧
- [ ] User management interface
- [ ] Order management system
- [ ] Real-time notifications

### **Phase 3: Advanced Features** 📋
- [ ] Product management
- [ ] Advanced analytics & reporting
- [ ] Delivery partner management
- [ ] System settings

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_ADMIN_PORT=3001
REACT_APP_CUSTOMER_APP_URL=http://localhost:3000
```

### **Port Configuration**
- Admin Portal: `3001`
- Customer App: `3000`
- Backend API: `8080`

---

## 🤝 **Contributing**

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Implement proper error handling
4. Add loading states for better UX
5. Ensure responsive design

---

## 📞 **Support**

For admin portal issues or feature requests, please contact the development team.

---

**🎯 Built for efficient grocery delivery management - Grocito Admin Portal**