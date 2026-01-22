# Grocito User Application

The customer-facing web application for the Grocito grocery delivery platform.

## Overview

This React application provides the primary interface for customers to browse products, manage their cart, place orders, and track deliveries. Built with React 18 and styled using Tailwind CSS for a responsive, mobile-first experience.

## Features

- Location-based onboarding with pincode validation
- Product catalog with search and category filters
- Shopping cart with quantity management
- Secure checkout with multiple payment options
- Real-time order tracking
- Order history and reordering
- User profile management

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- Backend API running on `http://localhost:8080`

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with required values:
   ```
   REACT_APP_API_URL=http://localhost:8080
   REACT_APP_WEATHER_API_KEY=your_openweathermap_api_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm test` | Run test suite |
| `npm run build` | Create production build |
| `npm run lint` | Run ESLint |

## Application Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with location entry |
| `/login` | User authentication |
| `/signup` | New user registration |
| `/products` | Product catalog |
| `/cart` | Shopping cart |
| `/checkout` | Order placement |
| `/orders` | Order history |
| `/profile` | User profile settings |

## Project Structure

```
src/
├── api/              # API service modules
├── components/       # React components
├── services/         # Business logic services
├── index.js          # Application entry point
└── App.js            # Root component with routing
```

## Configuration

The application connects to the backend API for all data operations. Ensure the backend server is running before starting the frontend.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | Yes | Backend API base URL |
| `REACT_APP_WEATHER_API_KEY` | No | OpenWeatherMap API key for location services |

## Building for Production

```bash
npm run build
```

The optimized production build will be created in the `build/` directory, ready for deployment to any static hosting service.

## Testing

Run the test suite:
```bash
npm test
```

For coverage report:
```bash
npm test -- --coverage
```
