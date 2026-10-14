package models

import (
	"time"
)

type User struct {
	ID           int64     `json:"id" db:"id"`
	Login        string    `json:"login" db:"login"`
	PasswordHash string    `json:"-" db:"password_hash"`
	Role         string    `json:"role" db:"role"`
	TelegramID   *int64    `json:"telegram_id" db:"telegram_id"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

type Category struct {
	ID   int64  `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Icon string `json:"icon" db:"icon"`
}

type Book struct {
	ID          int64     `json:"id" db:"id"`
	Title       string    `json:"title" db:"title"`
	Author      string    `json:"author" db:"author"`
	CategoryID  *int64    `json:"category_id" db:"category_id"`
	Description *string   `json:"description" db:"description"`
	Price       float64   `json:"price" db:"price"`
	OldPrice    *float64  `json:"old_price" db:"old_price"`
	Pages       *int      `json:"pages" db:"pages"`
	Rating      *float64  `json:"rating" db:"rating"`
	CoverURL    *string   `json:"cover_url" db:"cover_url"`
	FileURL     *string   `json:"file_url" db:"file_url"`
	IsPopular   bool      `json:"is_popular" db:"is_popular"`
	IsSpecial   bool      `json:"is_special" db:"is_special"`
	Active      bool      `json:"active" db:"active"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type Order struct {
	ID              int64     `json:"id" db:"id"`
	BuyerTelegramID int64     `json:"buyer_telegram_id" db:"buyer_telegram_id"`
	Total           float64   `json:"total" db:"total"`
	Status          string    `json:"status" db:"status"`
	ItemsSummary    *string   `json:"items_summary,omitempty" db:"items_summary"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
}

type OrderItem struct {
	ID      int64   `json:"id" db:"id"`
	OrderID int64   `json:"order_id" db:"order_id"`
	BookID  int64   `json:"book_id" db:"book_id"`
	Price   float64 `json:"price" db:"price"`
}

type AuditLog struct {
	ID        int64     `json:"id" db:"id"`
	UserID    *int64    `json:"user_id" db:"user_id"`
	Action    string    `json:"action" db:"action"`
	Entity    string    `json:"entity" db:"entity"`
	EntityID  *int64    `json:"entity_id" db:"entity_id"`
	Details   *string   `json:"details" db:"details"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type StatsDaily struct {
	Date         string  `json:"date" db:"date"`
	OrdersCount  int     `json:"orders_count" db:"orders_count"`
	Revenue      float64 `json:"revenue" db:"revenue"`
	TopBookID    *int64  `json:"top_book_id" db:"top_book_id"`
}
