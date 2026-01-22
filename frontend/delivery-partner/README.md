# Grocito Delivery Partner Application

The mobile-optimized web application for delivery partners on the Grocito platform.

## Overview

This React application enables delivery partners to manage their orders, update delivery statuses, track earnings, and control their availability. Designed with a mobile-first approach for use on the go.

## Features

- Partner authentication and registration
- Available order queue
- Active delivery management
- Real-time status updates
- Earnings dashboard and history
- Availability toggle
- Profile and document management

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

The application will be available at `http://localhost:3002`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 3002 |
| `npm test` | Run test suite |
| `npm run build` | Create production build |

## Application Routes

| Route | Description |
|-------|-------------|
| `/login` | Partner authentication |
| `/register` | New partner registration |
| `/dashboard` | Main dashboard with stats |
| `/orders` | Order queue and management |
| `/earnings` | Earnings history and payouts |
| `/profile` | Profile and settings |

## Project Structure

```
src/
├── components/
│   ├── common/           # Shared UI components
│   ├── dashboard/        # Dashboard widgets
│   ├── layout/           # Page layouts
│   └── payment/          # Payment components
├── config/               # Application configuration
├── hooks/                # Custom React hooks
├── pages/                # Page components
├── services/             # API services
├── store/                # Redux state management
└── utils/                # Utility functions
```

## State Management

The application uses Redux Toolkit for state management with the following slices:

- `authSlice` - Authentication state
- `ordersSlice` - Order data and status
- `dashboardSlice` - Dashboard statistics

## Partner Registration

New delivery partners must complete a verification process:

1. Submit registration with required documents
2. Admin reviews and approves application
3. Partner receives access credentials
4. Partner can begin accepting deliveries

## Building for Production

```bash
npm run build
```

The production build will be created in the `build/` directory, optimized for mobile web deployment.
