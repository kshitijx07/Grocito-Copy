# Grocito Frontend

A modern React frontend for the Grocito grocery delivery application built with Tailwind CSS.

## Features

- **Landing Page**: Location detection and pincode entry
- **Service Availability Check**: Checks if delivery is available in the user's area
- **User Authentication**: Login and signup functionality
- **Product Browsing**: View products available in the user's location
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend server running on `http://localhost:8080`

### Installation

1. Navigate to the frontend directory:
```bash
cd Grocito/frontend
```

2. Install dependencies (already done):
```bash
npm install
```

3. Set up environment variables:
   - Copy the `.env.example` file to a new file named `.env`
   - Get an API key from [OpenWeatherMap](https://home.openweathermap.org/api_keys) (free tier is sufficient)
   - Replace `your_openweathermap_api_key_here` with your actual API key

```bash
# Example .env file content
REACT_APP_WEATHER_API_KEY=your_actual_api_key_here
```

4. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Application Flow

1. **Landing Page** (`/`)
   - Enter pincode or city name
   - Use location detection
   - Check service availability

2. **Service Available** → Redirect to login/signup
3. **Service Not Available** (`/not-available`) → Show "coming soon" message
4. **Login** (`/login`) → Authenticate user
5. **Signup** (`/signup`) → Register new user
6. **Products** (`/products`) → Browse available products

## Demo Accounts

For testing purposes, you can use these demo accounts:

- **Admin**: admin@grocito.com / admin123
- **User**: john@example.com / password123

## Available Service Areas

Currently serving these pincodes:
- Delhi: 110001, 110002, 110003
- Mumbai: 400001, 400002, 400003  
- Bangalore: 560001, 560002, 560003

## API Integration

The frontend integrates with the Spring Boot backend running on `http://localhost:8080/api`:

- Authentication endpoints (`/users/login`, `/users/register`)
- Product endpoints (`/products/pincode/{pincode}`)
- Service availability checking

## Technologies Used

- **React 19** - Frontend framework
- **React Router 6** - Client-side routing
- **Tailwind CSS 3** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Inter Font** - Modern typography
- **OpenWeatherMap API** - For accurate location detection and geocoding

## Project Structure

```
src/
├── api/                 # API service layer
│   ├── authService.js   # Authentication APIs
│   ├── productService.js # Product APIs
│   ├── locationService.js # Location utilities
│   ├── geocodingService.js # Real geocoding with OpenWeatherMap API
│   └── config.js        # Axios configuration
├── components/          # React components
│   ├── LandingPage.js   # Main landing page
│   ├── LoginPage.js     # User login
│   ├── SignUpPage.js    # User registration
│   ├── ProductsPage.js  # Product listing
│   └── ServiceNotAvailable.js # Service unavailable page
├── App.js              # Main app component with routing
└── index.js            # App entry point
```

## Next Steps

This is the initial implementation focusing on:
- Location-based service checking
- User authentication
- Basic product display

Future enhancements will include:
- Shopping cart functionality
- Order placement and tracking
- Payment integration
- Admin dashboard
- Real-time order updates