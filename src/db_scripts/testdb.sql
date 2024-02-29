-- Create the schema if it doesn't exist
CREATE DATABASE IF NOT EXISTS device_management;
USE device_management;

-- Create the devices table with a uuid field
CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    UNIQUE KEY unique_device (name, brand, model)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(255),
    bio TEXT,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data into the devices table
-- Note: You will need to generate UUIDs for these sample insertions.
INSERT INTO devices (uuid, name, type, brand, model, status) VALUES
(UUID(), 'iPhone 12', 'Smartphone', 'Apple', 'A2172', 'active'),
(UUID(), 'Galaxy S21', 'Smartphone', 'Samsung', 'SM-G991U', 'active'),
(UUID(), 'iPad Pro', 'Tablet', 'Apple', 'A2229', 'active'),
(UUID(), 'ThinkPad X1', 'Laptop', 'Lenovo', '20QD00L1US', 'active'),
(UUID(), 'Pixel 5', 'Smartphone', 'Google', 'GD1YQ', 'inactive'),
(UUID(), 'Surface Pro 7', 'Tablet', 'Microsoft', 'VDV-00001', 'active'),
(UUID(), 'XPS 15', 'Laptop', 'Dell', '9500', 'active'),
(UUID(), 'MacBook Air', 'Laptop', 'Apple', 'M1', 'active'),
(UUID(), 'Fire HD 10', 'Tablet', 'Amazon', 'B07K1RZWMC', 'inactive'),
(UUID(), 'Rog Phone 5', 'Smartphone', 'Asus', 'ZS673KS', 'active');



INSERT INTO users (uuid, username, password, name, email, role, bio, avatar)
VALUES (UUID(), 'tester', 'password123', 'Test User', 'tester@example.com', 'Developer', 'This is a test bio.', '');
