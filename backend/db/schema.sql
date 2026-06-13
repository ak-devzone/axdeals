-- AK Deals Hub Database Schema
-- This file is auto-executed by the server on startup via config/initDB.js
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS + INSERT IGNORE

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'content_manager', 'marketing_manager', 'support') DEFAULT 'user',
  status ENUM('active', 'blocked') DEFAULT 'active',
  avatar VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  image VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  parent_id INT DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  logo VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  website VARCHAR(500) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(280) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  original_price DECIMAL(12, 2) DEFAULT NULL,
  image VARCHAR(500) DEFAULT NULL,
  images JSON DEFAULT NULL,
  videos JSON DEFAULT NULL,
  category_id INT,
  brand_id INT,
  rating DECIMAL(3, 1) DEFAULT 0,
  review_count INT DEFAULT 0,
  is_featured TINYINT(1) DEFAULT 0,
  is_trending TINYINT(1) DEFAULT 0,
  is_deal TINYINT(1) DEFAULT 0,
  deal_expires_at TIMESTAMP NULL DEFAULT NULL,
  specifications JSON DEFAULT NULL,
  meta_title VARCHAR(255) DEFAULT NULL,
  meta_description TEXT DEFAULT NULL,
  status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

-- Affiliate Links table
CREATE TABLE IF NOT EXISTS affiliate_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  amazon_link VARCHAR(1000) DEFAULT NULL,
  flipkart_link VARCHAR(1000) DEFAULT NULL,
  croma_link VARCHAR(1000) DEFAULT NULL,
  vijaysales_link VARCHAR(1000) DEFAULT NULL,
  meesho_link VARCHAR(1000) DEFAULT NULL,
  myntra_link VARCHAR(1000) DEFAULT NULL,
  other_link VARCHAR(1000) DEFAULT NULL,
  other_store_name VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Click Tracking table
CREATE TABLE IF NOT EXISTS click_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  product_id INT NOT NULL,
  platform VARCHAR(50) NOT NULL,
  ip_address VARCHAR(50) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  referrer VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =============================================
-- SEED DATA
-- =============================================

-- Admin user (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin', 'admin@akdealshub.com', '$2a$10$8K1p/a0dL1LXMv7fO/nBCeOo6g6GHvIzT5VZmD0xL/n4sG1v7vLHa', 'admin');

-- Categories
INSERT IGNORE INTO categories (name, slug, image, description) VALUES
('Mobiles', 'mobiles', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'Latest smartphones and mobile phones'),
('Laptops', 'laptops', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', 'Laptops for work, gaming, and everyday use'),
('Electronics', 'electronics', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', 'Gadgets, accessories, and electronic devices'),
('Fashion', 'fashion', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', 'Clothing, footwear, and accessories'),
('Home Appliances', 'home-appliances', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 'Kitchen, home, and living appliances'),
('Books', 'books', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400', 'Fiction, non-fiction, educational, and more'),
('Gaming', 'gaming', 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400', 'Gaming consoles, accessories, and games'),
('Beauty', 'beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 'Skincare, makeup, and personal care');

-- Brands
INSERT IGNORE INTO brands (name, slug, logo) VALUES
('Apple', 'apple', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'),
('Samsung', 'samsung', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200'),
('OnePlus', 'oneplus', 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=200'),
('Sony', 'sony', 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=200'),
('HP', 'hp', 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=200'),
('Dell', 'dell', 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=200'),
('Nike', 'nike', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'),
('Boat', 'boat', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'),
('LG', 'lg', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200'),
('Xiaomi', 'xiaomi', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200');

-- Products
INSERT IGNORE INTO products (name, slug, description, price, original_price, image, category_id, brand_id, rating, review_count, is_featured, is_trending, is_deal) VALUES
('iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 'The most powerful iPhone ever with A17 Pro chip, titanium design, 48MP camera system, and USB-C connectivity.', 134900.00, 159900.00, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', 1, 1, 4.8, 1250, 1, 1, 1),
('Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Galaxy AI powered smartphone with 200MP camera, S Pen, titanium frame, and Snapdragon 8 Gen 3.', 129999.00, 144999.00, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600', 1, 2, 4.7, 980, 1, 1, 0),
('MacBook Air M3 15-inch', 'macbook-air-m3-15-inch', 'Supercharged by M3 chip with 18-hour battery life, Liquid Retina display, and fanless design.', 144900.00, 154900.00, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', 2, 1, 4.9, 650, 1, 0, 1),
('Dell XPS 15 (2024)', 'dell-xps-15-2024', 'Premium ultrabook with InfinityEdge display, 13th Gen Intel Core, and NVIDIA RTX graphics.', 149990.00, 179990.00, 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600', 2, 6, 4.6, 420, 1, 0, 0),
('Sony WH-1000XM5 Headphones', 'sony-wh-1000xm5', 'Industry-leading noise cancellation with Auto NC Optimizer, crystal clear hands-free calling, and 30-hour battery.', 24990.00, 34990.00, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600', 3, 4, 4.8, 2100, 0, 1, 1),
('OnePlus 12 5G', 'oneplus-12-5g', 'Flagship killer with Snapdragon 8 Gen 3, 100W SUPERVOOC charging, and Hasselblad camera.', 64999.00, 69999.00, 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600', 1, 3, 4.5, 760, 0, 1, 0),
('Nike Air Max 270', 'nike-air-max-270', 'Iconic lifestyle sneaker with Max Air unit for all-day comfort and bold street style.', 12995.00, 15995.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 4, 7, 4.4, 3200, 0, 0, 1),
('boAt Airdopes 441 TWS', 'boat-airdopes-441-tws', 'True wireless earbuds with IWP technology, IPX7 water resistance, and 30H total playback.', 1499.00, 4490.00, 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600', 3, 8, 4.1, 15600, 0, 1, 1),
('LG 55-inch 4K OLED TV', 'lg-55-inch-4k-oled-tv', 'Self-lit OLED pixels with Dolby Vision, Dolby Atmos, webOS, and α9 Gen6 AI Processor.', 109990.00, 149990.00, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600', 5, 9, 4.7, 890, 1, 0, 1),
('HP Pavilion Gaming Laptop', 'hp-pavilion-gaming-laptop', 'Budget gaming laptop with AMD Ryzen 5, NVIDIA GTX 1650, 144Hz display, and 512GB SSD.', 54990.00, 69990.00, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600', 7, 5, 4.3, 1100, 0, 0, 0),
('Xiaomi Pad 6 Pro', 'xiaomi-pad-6-pro', 'Premium Android tablet with Snapdragon 8+ Gen 1, 144Hz display, and quad speakers.', 29999.00, 34999.00, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600', 3, 10, 4.4, 540, 0, 1, 0),
('Samsung 65-inch Crystal 4K UHD TV', 'samsung-65-inch-crystal-4k', 'Crystal Processor 4K with PurColor, HDR, Smart TV features and Alexa built-in.', 59990.00, 94900.00, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600', 5, 2, 4.5, 2300, 1, 1, 1);

-- Affiliate Links
INSERT IGNORE INTO affiliate_links (product_id, amazon_link, flipkart_link, croma_link) VALUES
(1, 'https://www.amazon.in/s?k=iPhone+15+Pro+Max&tag=akdealshub-21', 'https://www.flipkart.com/search?q=iPhone+15+Pro+Max', 'https://www.croma.com/search/?text=iPhone+15+Pro+Max'),
(2, 'https://www.amazon.in/s?k=Samsung+Galaxy+S24+Ultra&tag=akdealshub-21', 'https://www.flipkart.com/search?q=Samsung+Galaxy+S24+Ultra', 'https://www.croma.com/search/?text=Samsung+Galaxy+S24+Ultra'),
(3, 'https://www.amazon.in/s?k=MacBook+Air+M3+15-inch&tag=akdealshub-21', 'https://www.flipkart.com/search?q=MacBook+Air+M3+15-inch', NULL),
(4, 'https://www.amazon.in/s?k=Dell+XPS+15+2024&tag=akdealshub-21', 'https://www.flipkart.com/search?q=Dell+XPS+15+2024', 'https://www.croma.com/search/?text=Dell+XPS+15+2024'),
(5, 'https://www.amazon.in/s?k=Sony+WH-1000XM5+Headphones&tag=akdealshub-21', 'https://www.flipkart.com/search?q=Sony+WH-1000XM5+Headphones', 'https://www.croma.com/search/?text=Sony+WH-1000XM5+Headphones'),
(6, 'https://www.amazon.in/s?k=OnePlus+12+5G&tag=akdealshub-21', 'https://www.flipkart.com/search?q=OnePlus+12+5G', NULL),
(7, 'https://www.amazon.in/s?k=Nike+Air+Max+270&tag=akdealshub-21', 'https://www.flipkart.com/search?q=Nike+Air+Max+270', NULL),
(8, 'https://www.amazon.in/s?k=boAt+Airdopes+441+TWS&tag=akdealshub-21', 'https://www.flipkart.com/search?q=boAt+Airdopes+441+TWS', NULL),
(9, 'https://www.amazon.in/s?k=LG+55-inch+4K+OLED+TV&tag=akdealshub-21', 'https://www.flipkart.com/search?q=LG+55-inch+4K+OLED+TV', 'https://www.croma.com/search/?text=LG+55-inch+4K+OLED+TV'),
(10, 'https://www.amazon.in/s?k=HP+Pavilion+Gaming+Laptop&tag=akdealshub-21', 'https://www.flipkart.com/search?q=HP+Pavilion+Gaming+Laptop', NULL),
(11, 'https://www.amazon.in/s?k=Xiaomi+Pad+6+Pro&tag=akdealshub-21', 'https://www.flipkart.com/search?q=Xiaomi+Pad+6+Pro', NULL),
(12, 'https://www.amazon.in/s?k=Samsung+65-inch+Crystal+4K&tag=akdealshub-21', 'https://www.flipkart.com/search?q=Samsung+65-inch+Crystal+4K', 'https://www.croma.com/search/?text=Samsung+65-inch+Crystal+4K');

-- Indexes for performance
-- (Created only if they don't already exist — handled by initDB.js)
