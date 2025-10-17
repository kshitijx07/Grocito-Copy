# Backend Dockerfile for Spring Boot
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port (Render uses PORT environment variable)
EXPOSE $PORT

# Run the application
CMD ["sh", "-c", "java -Dserver.port=$PORT -jar target/Grocito-0.0.1-SNAPSHOT.jar"]