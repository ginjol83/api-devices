-- Create the schema if it doesn't exist
CREATE DATABASE IF NOT EXISTS device_management;
USE device_management;

-- Create the devices table
CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    UNIQUE KEY unique_device (name, brand, model)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data into the devices table
INSERT INTO devices (name, type, brand, model, status) VALUES
('iPhone 12', 'Smartphone', 'Apple', 'A2172', 'active'),
('Galaxy S21', 'Smartphone', 'Samsung', 'SM-G991U', 'active'),
('iPad Pro', 'Tablet', 'Apple', 'A2229', 'active'),
('ThinkPad X1', 'Laptop', 'Lenovo', '20QD00L1US', 'active'),
('Pixel 5', 'Smartphone', 'Google', 'GD1YQ', 'inactive'),
('Surface Pro 7', 'Tablet', 'Microsoft', 'VDV-00001', 'active'),
('XPS 15', 'Laptop', 'Dell', '9500', 'active'),
('MacBook Air', 'Laptop', 'Apple', 'M1', 'active'),
('Fire HD 10', 'Tablet', 'Amazon', 'B07K1RZWMC', 'inactive'),
('Rog Phone 5', 'Smartphone', 'Asus', 'ZS673KS', 'active');