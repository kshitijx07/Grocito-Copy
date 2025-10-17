# Frontend Dockerfile for React
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY frontend/ .

# Build the application for production
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Render uses PORT environment variable
EXPOSE $PORT

# Start nginx with dynamic port
CMD ["sh", "-c", "sed -i 's/80/$PORT/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]