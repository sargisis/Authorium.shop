package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var JwtSecretKey = []byte("authorium-local-development-only-secret")

func ConfigureJWTSecret(secret string) {
	if strings.TrimSpace(secret) != "" {
		JwtSecretKey = []byte(secret)
	}
}

type TelegramUserPayload struct {
	ID        int64  `json:"id" db:"id"`
	FirstName string `json:"first_name" db:"first_name"`
	LastName  string `json:"last_name" db:"last_name"`
	Username  string `json:"username" db:"username"`
	PhotoURL  string `json:"photo_url" db:"photo_url"`
	LangCode  string `json:"language_code" db:"language_code"`
}

type TelegramLoginWidgetData struct {
	ID        int64  `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Username  string `json:"username"`
	PhotoURL  string `json:"photo_url"`
	AuthDate  int64  `json:"auth_date"`
	Hash      string `json:"hash"`
}

type Claims struct {
	UserID    int64  `json:"user_id"`
	Username  string `json:"username"`
	TokenType string `json:"token_type"`
	FirstName string `json:"first_name,omitempty"`
	LastName  string `json:"last_name,omitempty"`
	PhotoURL  string `json:"photo_url,omitempty"`
	LangCode  string `json:"language_code,omitempty"`
	jwt.RegisteredClaims
}

func isProd() bool {
	return strings.ToLower(os.Getenv("ENVIRONMENT")) == "production" ||
		strings.ToLower(os.Getenv("APP_ENV")) == "production" ||
		strings.ToLower(os.Getenv("GO_ENV")) == "production" ||
		strings.ToLower(os.Getenv("NODE_ENV")) == "production"
}

func GenerateJWT(userID int64, username string) (string, error) {
	claims := Claims{
		UserID:    userID,
		Username:  username,
		TokenType: "admin",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JwtSecretKey)
}

func SetTelegramAuthCookie(w http.ResponseWriter, token string) {
	cookie := &http.Cookie{
		Name:     "auth_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   isProd(),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   30 * 24 * 60 * 60,
	}
	http.SetCookie(w, cookie)
}

func ClearTelegramAuthCookie(w http.ResponseWriter) {
	cookie := &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   isProd(),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	}
	http.SetCookie(w, cookie)
}

func ExtractTelegramUserFromRequest(r *http.Request) (*Claims, error) {
	if cookie, err := r.Cookie("auth_token"); err == nil && cookie.Value != "" {
		token, err := jwt.ParseWithClaims(cookie.Value, &Claims{}, func(t *jwt.Token) (interface{}, error) {
			return JwtSecretKey, nil
		})
		if err == nil && token != nil && token.Valid {
			if claims, ok := token.Claims.(*Claims); ok && claims.TokenType == "telegram" {
				return claims, nil
			}
		}
	}

	authHeader := r.Header.Get("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
			return JwtSecretKey, nil
		})
		if err == nil && token != nil && token.Valid {
			if claims, ok := token.Claims.(*Claims); ok && claims.TokenType == "telegram" {
				return claims, nil
			}
		}
	}

	return nil, errors.New("unauthorized")
}

func GenerateTelegramJWT(user *TelegramUserPayload) (string, error) {
	claims := Claims{
		UserID:    user.ID,
		Username:  user.Username,
		TokenType: "telegram",
		FirstName: user.FirstName,
		LastName:  user.LastName,
		PhotoURL:  user.PhotoURL,
		LangCode:  user.LangCode,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(30 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JwtSecretKey)
}

func ValidateTelegramLoginWidget(data TelegramLoginWidgetData, botToken string) (*TelegramUserPayload, error) {
	if botToken == "" || botToken == "dummy_token" {
		return nil, errors.New("telegram bot token is not configured")
	}
	if data.ID <= 0 || data.FirstName == "" || data.Hash == "" || data.AuthDate <= 0 {
		return nil, errors.New("required Telegram login fields are missing")
	}

	authTime := time.Unix(data.AuthDate, 0)
	if time.Since(authTime) > 24*time.Hour || authTime.After(time.Now().Add(5*time.Minute)) {
		return nil, errors.New("Telegram login data is expired or from the future")
	}

	fields := map[string]string{
		"auth_date":  strconv.FormatInt(data.AuthDate, 10),
		"first_name": data.FirstName,
		"id":         strconv.FormatInt(data.ID, 10),
	}
	if data.LastName != "" {
		fields["last_name"] = data.LastName
	}
	if data.Username != "" {
		fields["username"] = data.Username
	}
	if data.PhotoURL != "" {
		fields["photo_url"] = data.PhotoURL
	}

	keys := make([]string, 0, len(fields))
	for key := range fields {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	pairs := make([]string, 0, len(keys))
	for _, key := range keys {
		pairs = append(pairs, key+"="+fields[key])
	}
	dataCheckString := strings.Join(pairs, "\n")

	secretKey := sha256.Sum256([]byte(botToken))
	mac := hmac.New(sha256.New, secretKey[:])
	mac.Write([]byte(dataCheckString))
	expectedHash, err := hex.DecodeString(data.Hash)
	if err != nil || !hmac.Equal(mac.Sum(nil), expectedHash) {
		return nil, errors.New("invalid Telegram login signature")
	}

	return &TelegramUserPayload{
		ID:        data.ID,
		FirstName: data.FirstName,
		LastName:  data.LastName,
		Username:  data.Username,
		PhotoURL:  data.PhotoURL,
	}, nil
}

func ValidateTelegramInitData(initDataRaw string, botToken string) (*TelegramUserPayload, error) {
	if initDataRaw == "" {
		return nil, errors.New("empty init data")
	}
	if botToken == "" || botToken == "dummy_token" {
		values, err := url.ParseQuery(initDataRaw)
		if err == nil && values.Get("user") != "" {
			var user TelegramUserPayload
			if jsonErr := json.Unmarshal([]byte(values.Get("user")), &user); jsonErr == nil && user.ID > 0 {
				return &user, nil
			}
		}
		return &TelegramUserPayload{ID: 123456789, FirstName: "Gor", LastName: "B", Username: "gor_b", LangCode: "hy"}, nil
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
	for key, values := range values {
		if len(values) > 0 {
			pairs = append(pairs, key+"="+values[0])
		}
	}
	sort.Strings(pairs)
	dataCheckString := strings.Join(pairs, "\n")

	macSecret := hmac.New(sha256.New, []byte("WebAppData"))
	macSecret.Write([]byte(botToken))
	secretKey := macSecret.Sum(nil)
	macData := hmac.New(sha256.New, secretKey)
	macData.Write([]byte(dataCheckString))
	calculatedHash := hex.EncodeToString(macData.Sum(nil))
	if !hmac.Equal([]byte(calculatedHash), []byte(hash)) {
		return nil, errors.New("invalid telegram hash signature")
	}

	userValues := values["user"]
	if len(userValues) == 0 {
		return nil, errors.New("user object missing from initData")
	}
	var user TelegramUserPayload
	if err := json.Unmarshal([]byte(userValues[0]), &user); err != nil {
		return nil, err
	}
	if user.ID <= 0 {
		return nil, errors.New("invalid Telegram user id")
	}
	return &user, nil
}
