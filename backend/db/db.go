package db

import (
	"embed"
	"log"
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"github.com/pressly/goose/v3"
)

//go:embed migrations/*.sql
var embedMigrations embed.FS

func InitDB() *sqlx.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "authorium.db?_journal_mode=WAL&_busy_timeout=5000&_foreign_keys=on"
	}

	db, err := sqlx.Connect("sqlite3", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Avoid SQLite database locking conflicts during concurrent operations
	db.SetMaxOpenConns(1)

	goose.SetBaseFS(embedMigrations)

	if err := goose.SetDialect("sqlite3"); err != nil {
		log.Fatalf("Failed to set goose dialect: %v", err)
	}

	if err := goose.Up(db.DB, "migrations"); err != nil {
		log.Fatalf("Database migration failed: %v", err)
	}

	return db
}
