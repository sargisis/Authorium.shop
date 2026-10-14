package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var (
	JwtSecretKey = []byte("authorium-super-jwt-secret-key-12345")
)

type TelegramUserPayload struct {
	ID        int64  `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Username  string `json:"username"`
	LangCode  string `json:"language_code"`
}

type Claims struct {
	UserID   int64  `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// GenerateJWT creates a session token for authenticated user
func GenerateJWT(userID int64, username string) (string, error) {
	claims := Claims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JwtSecretKey)
}

// ValidateTelegramInitData verifies the HMAC-SHA256 signature of initData
func ValidateTelegramInitData(initDataRaw string, botToken string) (*TelegramUserPayload, error) {
	if initDataRaw == "" {
		return nil, errors.New("empty init data")
	}

	// For local development or mock mode without bot token check
	if botToken == "" || botToken == "dummy_token" {
		// Mock parse user if exists
		values, err := url.ParseQuery(initDataRaw)
		if err == nil && values.Get("user") != "" {
			var user TelegramUserPayload
			if jsonErr := json.Unmarshal([]byte(values.Get("user")), &user); jsonErr == nil {
				return &user, nil
			}
		}
		return &TelegramUserPayload{
			ID:        123456789,
			FirstName: "Gor",
			LastName:  "B",
			Username:  "gor_b",
			LangCode:  "hy",
		}, nil
	}

	values, err := url.ParseQuery(initDataRaw)
	if err != nil {
		return nil, err
	}

	hash := values.Get("hash")
	if hash == "" {
		return nil, errors.New("hash missing from initData")
	}

	values.Del("hash")

	var pairs []string
	for k, v := range values {
		pairs = append(pairs, k+"="+v[0])
	}
	sort.Strings(pairs)
	dataCheckString := strings.Join(pairs, "\n")

	// secret_key = HMAC_SHA256("WebAppData", botToken)
	macSecret := hmac.New(sha256.New, []byte("WebAppData"))
	macSecret.Write([]byte(botToken))
	secretKey := macSecret.Sum(nil)

	// calculated_hash = HMAC_SHA256(secretKey, dataCheckString)
	macData := hmac.New(sha256.New, secretKey)
	macData.Write([]byte(dataCheckString))
	calculatedHash := hex.EncodeToString(macData.Sum(nil))

	if !hmac.Equal([]byte(calculatedHash), []byte(hash)) {
		return nil, errors.New("invalid telegram hash signature")
	}

	userStr := values.Get("user")
	if userStr == "" {
		return nil, errors.New("user object missing from initData")
	}

	var tgUser TelegramUserPayload
	if err := json.Unmarshal([]byte(userStr), &tgUser); err != nil {
		return nil, err
	}

	return &tgUser, nil
}

// TelegramAuthMiddleware checks Authorization header or X-Telegram-Init-Data
func TelegramAuthMiddleware(botToken string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		initDataHeader := c.GetHeader("X-Telegram-Init-Data")

		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
				return JwtSecretKey, nil
			})
			if err == nil && token.Valid {
				if claims, ok := token.Claims.(*Claims); ok {
					c.Set("user_id", claims.UserID)
					c.Set("username", claims.Username)
					c.Next()
					return
				}
			}
		}

		if initDataHeader != "" {
			tgUser, err := ValidateTelegramInitData(initDataHeader, botToken)
			if err == nil && tgUser != nil {
				c.Set("user_id", tgUser.ID)
				c.Set("username", tgUser.Username)
				c.Next()
				return
			}
		}

		// Optional dev fallback if testing directly
		if gin.Mode() != gin.ReleaseMode && (authHeader == "dev" || initDataHeader == "dev") {
			c.Set("user_id", int64(123456789))
			c.Set("username", "gor_b")
			c.Next()
			return
		}

		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized Telegram session"})
		c.Abort()
	}
}
