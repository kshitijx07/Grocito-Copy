-- Grocito Database Initialization Script
-- This script runs when MySQL container starts for the first time

-- Create database if not exists (usually handled by MYSQL_DATABASE env var)
CREATE DATABASE IF NOT EXISTS grocito_db;

USE grocito_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON grocito_db.* TO 'grocito_user'@'%';
FLUSH PRIVILEGES;

-- Note: Tables are created automatically by Spring Boot JPA
-- This file is for any additional initialization if needed

-- Example: Create admin user after tables are created
-- INSERT INTO users (email, password, role, name) VALUES 
-- ('admin@grocito.com', '$2a$10$...', 'ADMIN', 'Admin User');
