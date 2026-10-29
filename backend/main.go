package main

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"authorium-backend/auth"
	"authorium-backend/bot"
	"authorium-backend/db"
	"authorium-backend/handlers"
	"authorium-backend/middleware"

	"github.com/joho/godotenv"
)

func corsMiddleware(next http.Handler) http.Handler {
	allowedOrigins := strings.Split(os.Getenv("CORS_ALLOWED_ORIGINS"), ",")

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		allowed := false
		if origin != "" {
			if strings.HasSuffix(origin, ".trycloudflare.com") ||
				strings.HasSuffix(origin, "authorium.store") ||
				strings.HasPrefix(origin, "http://localhost:") ||
				strings.HasPrefix(origin, "http://127.0.0.1:") {
				allowed = true
			}
			for _, allowedOrigin := range allowedOrigins {
				if strings.TrimSpace(allowedOrigin) == origin {
					allowed = true
					break
				}
			}
		}

		if allowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		} else if origin == "" {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Telegram-Init-Data")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	_ = godotenv.Load()
	auth.ConfigureJWTSecret(os.Getenv("JWT_SECRET"))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		botToken = "dummy_token"
	}

	webAppURL := os.Getenv("WEBAPP_URL")
	if webAppURL == "" {
		webAppURL = "https://app.authorium.store"
	}

	// Launch Telegram Bot in background
	go bot.StartBot(botToken, webAppURL)

	database := db.InitDB()
	h := handlers.NewHandler(database, botToken)

	// Rate limiters
	loginLimiter := middleware.NewRateLimiter(15, 1*time.Minute) // 15 login attempts per min
	apiLimiter := middleware.NewRateLimiter(120, 1*time.Minute)  // 120 API calls per min

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", h.HealthCheck)
	mux.HandleFunc("GET /api/v1/books", apiLimiter.LimitMiddleware(h.GetBooks))
	mux.HandleFunc("GET /api/v1/books/{id}", apiLimiter.LimitMiddleware(h.GetBookByID))
	mux.HandleFunc("GET /api/v1/categories", apiLimiter.LimitMiddleware(h.GetCategories))
	mux.HandleFunc("POST /api/v1/auth/telegram", loginLimiter.LimitMiddleware(h.TelegramAuth))
	mux.HandleFunc("POST /api/v1/auth/telegram/widget", loginLimiter.LimitMiddleware(h.TelegramWidgetAuth))
	mux.HandleFunc("GET /api/v1/auth/me", h.TelegramMe)
	mux.HandleFunc("POST /api/v1/auth/logout", h.TelegramLogout)
	mux.HandleFunc("POST /api/v1/payments/process", apiLimiter.LimitMiddleware(h.ProcessPayment))

	// Admin Auth with Rate Limiting
	mux.HandleFunc("POST /api/v1/auth/login", loginLimiter.LimitMiddleware(h.AdminLogin))

	// Protected Admin Routes (Session Required)
	authMiddleware := middleware.AdminAuthMiddleware
	mux.HandleFunc("GET /api/v1/me", authMiddleware(h.AdminGetMe))
	mux.HandleFunc("PUT /api/v1/admin/me/password", authMiddleware(h.AdminChangePassword))
	mux.HandleFunc("GET /api/v1/admin/users", authMiddleware(h.AdminGetUsers))
	mux.HandleFunc("POST /api/v1/admin/users", authMiddleware(h.AdminCreateUser))
	mux.HandleFunc("PUT /api/v1/admin/users/{id}", authMiddleware(h.AdminUpdateUser))
	mux.HandleFunc("DELETE /api/v1/admin/users/{id}", authMiddleware(h.AdminDeleteUser))

	mux.HandleFunc("GET /api/v1/admin/books", authMiddleware(h.AdminGetBooks))
	mux.HandleFunc("GET /api/v1/admin/books/{id}", authMiddleware(h.GetBookByID))
	mux.HandleFunc("POST /api/v1/admin/books", authMiddleware(h.AdminCreateBook))
	mux.HandleFunc("PUT /api/v1/admin/books/{id}", authMiddleware(h.AdminUpdateBook))
	mux.HandleFunc("DELETE /api/v1/admin/books/{id}", authMiddleware(h.AdminDeleteBook))

	mux.HandleFunc("GET /api/v1/stats/summary", authMiddleware(h.AdminGetStatsSummary))
	mux.HandleFunc("GET /api/v1/stats/sales", authMiddleware(h.AdminGetStatsSales))
	mux.HandleFunc("GET /api/v1/stats/top-books", authMiddleware(h.AdminGetTopBooks))
	mux.HandleFunc("GET /api/v1/admin/orders", authMiddleware(h.AdminGetOrders))
	mux.HandleFunc("GET /api/v1/admin/audit-log", authMiddleware(h.AdminGetAuditLog))

	// Static files for /books/ (covers and PDFs)
	booksDir := "books"
	if fi, err := os.Stat("../frontend/public/books"); err == nil && fi.IsDir() {
		booksDir = "../frontend/public/books"
	}
	mux.Handle("/books/", http.StripPrefix("/books/", http.FileServer(http.Dir(booksDir))))

	handler := corsMiddleware(mux)

	log.Printf("Authorium Backend running on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
