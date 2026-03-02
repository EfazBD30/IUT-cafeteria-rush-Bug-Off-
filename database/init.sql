-- this file runs automatically when postgres container starts
-- it creates our table and adds some starter food items

-- create the food_items table
CREATE TABLE IF NOT EXISTS food_items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL,
    stock_count INTEGER NOT NULL DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 0
);

-- insert 4 starter food items
-- version starts at 0 for optimistic locking
INSERT INTO food_items (id, name, price, stock_count, version) VALUES
    ('item_1', 'Beef Tehari', 60, 50, 0),
    ('item_2', 'Chicken Burger', 45, 30, 0),
    ('item_3', 'Egg Khichuri', 35, 5, 0),
    ('item_4', 'Paratha + Bhaji', 25, 80, 0);