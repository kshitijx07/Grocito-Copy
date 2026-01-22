# Grocito Admin Dashboard

The administrative control panel for managing the Grocito grocery delivery platform.

## Overview

This React application provides administrators with tools to manage products, orders, users, and delivery partners. The dashboard includes analytics, reporting, and operational controls for the entire platform.

## Features

- Secure admin-only authentication
- Dashboard with key performance metrics
- Product and inventory management
- Order monitoring and assignment
- User account administration
- Delivery partner verification
- Sales and revenue analytics

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- Backend API running on `http://localhost:8080`

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3001`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 3001 |
| `npm test` | Run test suite |
| `npm run build` | Create production build |

## Application Modules

| Module | Description |
|--------|-------------|
| Dashboard | Overview with statistics and quick actions |
| Products | Add, edit, delete products and manage inventory |
| Orders | View, update status, and assign delivery partners |
| Users | Manage customer accounts and permissions |
| Delivery Partners | Verify and manage delivery partner accounts |
| Analytics | Sales reports and performance metrics |

## Project Structure

```
src/
├── api/                    # API service modules
├── components/
│   ├── auth/              # Authentication components
│   ├── common/            # Shared UI components
│   ├── dashboard/         # Dashboard views
│   ├── products/          # Product management
│   ├── orders/            # Order management
│   ├── users/             # User management
│   └── delivery-partners/ # Partner management
├── services/              # Business logic
└── App.js                 # Root component
```

## Authentication

Access is restricted to users with admin role. The application validates user roles on login and redirects non-admin users appropriately.

### Admin Access

Admin accounts must be created directly in the database or through a seeding script. Contact the system administrator for access credentials.

## Building for Production

```bash
npm run build
```

The production build will be created in the `build/` directory.
