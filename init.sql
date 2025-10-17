-- Initialize Grocito Database
CREATE DATABASE IF NOT EXISTS grocito_db;
USE grocito_db;

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON grocito_db.* TO 'grocito_user'@'%';
FLUSH PRIVILEGES;