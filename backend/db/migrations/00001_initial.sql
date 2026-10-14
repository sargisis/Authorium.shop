-- +goose Up
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    telegram_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT
);

CREATE TABLE books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category_id INTEGER,
    description TEXT,
    price REAL NOT NULL,
    old_price REAL,
    pages INTEGER,
    rating REAL DEFAULT 5.0,
    cover_url TEXT,
    file_url TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    is_special BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id)
);
CREATE INDEX idx_books_active ON books(active);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_telegram_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(book_id) REFERENCES books(id)
);
CREATE INDEX idx_order_items_book_id ON order_items(book_id);

CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id INTEGER,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

CREATE TABLE stats_daily (
    date DATE PRIMARY KEY,
    orders_count INTEGER NOT NULL,
    revenue REAL NOT NULL,
    top_book_id INTEGER,
    FOREIGN KEY(top_book_id) REFERENCES books(id)
);

-- +goose Down
DROP TABLE stats_daily;
DROP TABLE audit_log;
DROP TABLE order_items;
DROP TABLE orders;
DROP TABLE books;
DROP TABLE categories;
DROP TABLE users;
