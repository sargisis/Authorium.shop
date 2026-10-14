package middleware

import (
	"encoding/json"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"authorium-backend/auth"

	"github.com/golang-jwt/jwt/v5"
)

type clientRecord struct {
	count     int
	resetTime time.Time
}

type RateLimiter struct {
	mu      sync.Mutex
	records map[string]*clientRecord
	limit   int
	window  time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		records: make(map[string]*clientRecord),
		limit:   limit,
		window:  window,
	}

	// Periodic cleanup of expired records every 5 minutes
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		for range ticker.C {
			rl.mu.Lock()
			now := time.Now()
			for ip, rec := range rl.records {
				if now.After(rec.resetTime) {
					delete(rl.records, ip)
				}
			}
			rl.mu.Unlock()
		}
	}()

	return rl
}

func getClientIP(r *http.Request) string {
	// Check Cloudflare header first, then X-Forwarded-For, then RemoteAddr
	cfIP := r.Header.Get("CF-Connecting-IP")
	if cfIP != "" {
		return cfIP
	}
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

func (rl *RateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	rec, exists := rl.records[ip]

	if !exists || now.After(rec.resetTime) {
		rl.records[ip] = &clientRecord{
			count:     1,
			resetTime: now.Add(rl.window),
		}
		return true
	}

	if rec.count >= rl.limit {
		return false
	}

	rec.count++
	return true
}

func (rl *RateLimiter) LimitMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip := getClientIP(r)
		if !rl.Allow(ip) {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.Header().Set("Retry-After", "60")
			w.WriteHeader(http.StatusTooManyRequests)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": "Չափազանց շատ հարցումներ: Խնդրում ենք սպասել 1 րոպե և փորձել կրկին:",
			})
			return
		}
		next(w, r)
	}
}

// AdminAuthMiddleware verifies JWT token from Authorization: Bearer <token>
func AdminAuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": "Մուտքն արգելված է: Խնդրում ենք մուտք գործել համակարգ:",
			})
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.ParseWithClaims(tokenStr, &auth.Claims{}, func(t *jwt.Token) (interface{}, error) {
			return auth.JwtSecretKey, nil
		})

		if err != nil || !token.Valid {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": "Սեսիան ավարտվել է կամ անվավեր է: Խնդրում ենք կրկին մուտք գործել:",
			})
			return
		}

		next(w, r)
	}
}
