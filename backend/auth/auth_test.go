package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sort"
	"strconv"
	"strings"
	"testing"
	"time"
)

const testBotToken = "123456:TEST-BOT-TOKEN"

func signInitData(t *testing.T, user TelegramUserPayload, authDate int64) string {
	t.Helper()
	userJSON, err := json.Marshal(user)
	if err != nil {
		t.Fatalf("marshal user: %v", err)
	}
	fields := map[string]string{
		"auth_date": strconv.FormatInt(authDate, 10),
		"query_id":  "AAHtestQueryId",
		"user":      string(userJSON),
	}
	dataCheckString := buildDataCheckString(fields)
	secret := hmac.New(sha256.New, []byte("WebAppData"))
	secret.Write([]byte(testBotToken))
	secretKey := secret.Sum(nil)
	mac := hmac.New(sha256.New, secretKey)
	mac.Write([]byte(dataCheckString))
	hash := hex.EncodeToString(mac.Sum(nil))
	fields["hash"] = hash

	parts := make([]string, 0, len(fields))
	for k, v := range fields {
		parts = append(parts, k+"="+v)
	}
	sort.Strings(parts)
	return strings.Join(parts, "&")
}

func buildDataCheckString(fields map[string]string) string {
	keys := make([]string, 0, len(fields))
	for k := range fields {
		if k == "hash" {
			continue
		}
		keys = append(keys, k)
	}
	sort.Strings(keys)
	pairs := make([]string, 0, len(keys))
	for _, k := range keys {
		pairs = append(pairs, k+"="+fields[k])
	}
	return strings.Join(pairs, "\n")
}

func signWidget(data TelegramLoginWidgetData) TelegramLoginWidgetData {
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
	dataCheckString := buildDataCheckString(fields)
	secretKey := sha256.Sum256([]byte(testBotToken))
	mac := hmac.New(sha256.New, secretKey[:])
	mac.Write([]byte(dataCheckString))
	data.Hash = hex.EncodeToString(mac.Sum(nil))
	return data
}

func TestValidateTelegramInitData_Valid(t *testing.T) {
	user := TelegramUserPayload{ID: 555000111, FirstName: "Test", LastName: "User", Username: "testuser", LangCode: "ru"}
	raw := signInitData(t, user, time.Now().Unix())

	got, err := ValidateTelegramInitData(raw, testBotToken)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.ID != user.ID || got.Username != user.Username || got.FirstName != user.FirstName {
		t.Fatalf("parsed user mismatch: %+v", got)
	}
}

func TestValidateTelegramInitData_InvalidHash(t *testing.T) {
	user := TelegramUserPayload{ID: 555000111, FirstName: "Test"}
	raw := signInitData(t, user, time.Now().Unix())
	raw = strings.Replace(raw, "hash=", "hash=dead", 1)

	if _, err := ValidateTelegramInitData(raw, testBotToken); err == nil {
		t.Fatal("expected error for tampered initData, got nil")
	}
}

func TestValidateTelegramInitData_Empty(t *testing.T) {
	if _, err := ValidateTelegramInitData("", testBotToken); err == nil {
		t.Fatal("expected error for empty initData, got nil")
	}
}

func TestValidateTelegramLoginWidget_Valid(t *testing.T) {
	data := signWidget(TelegramLoginWidgetData{
		ID: 555000111, FirstName: "Test", LastName: "User",
		Username: "testuser", AuthDate: time.Now().Unix(),
	})

	got, err := ValidateTelegramLoginWidget(data, testBotToken)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.ID != data.ID || got.Username != data.Username {
		t.Fatalf("parsed user mismatch: %+v", got)
	}
}

func TestValidateTelegramLoginWidget_BadHash(t *testing.T) {
	data := signWidget(TelegramLoginWidgetData{ID: 555000111, FirstName: "Test", AuthDate: time.Now().Unix()})
	data.Hash = "deadbeef"

	if _, err := ValidateTelegramLoginWidget(data, testBotToken); err == nil {
		t.Fatal("expected error for bad hash, got nil")
	}
}

func TestValidateTelegramLoginWidget_Expired(t *testing.T) {
	data := signWidget(TelegramLoginWidgetData{
		ID: 555000111, FirstName: "Test",
		AuthDate: time.Now().Add(-48 * time.Hour).Unix(),
	})

	if _, err := ValidateTelegramLoginWidget(data, testBotToken); err == nil {
		t.Fatal("expected error for expired auth_date, got nil")
	}
}

func TestGenerateTelegramJWT_RoundTrip(t *testing.T) {
	user := &TelegramUserPayload{ID: 42, FirstName: "A", Username: "a"}
	token, err := GenerateTelegramJWT(user)
	if err != nil {
		t.Fatalf("generate token: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	claims, err := ExtractTelegramUserFromRequest(req)
	if err != nil {
		t.Fatalf("extract claims: %v", err)
	}
	if claims.UserID != 42 || claims.TokenType != "telegram" {
		t.Fatalf("wrong claims: %+v", claims)
	}
}

func TestSetAndClearTelegramAuthCookie(t *testing.T) {
	user := &TelegramUserPayload{ID: 7, FirstName: "Cookie"}
	token, err := GenerateTelegramJWT(user)
	if err != nil {
		t.Fatalf("generate token: %v", err)
	}

	rec := httptest.NewRecorder()
	SetTelegramAuthCookie(rec, token)
	cookies := rec.Result().Cookies()
	if len(cookies) != 1 || cookies[0].Name != "auth_token" {
		t.Fatalf("expected auth_token cookie, got %+v", cookies)
	}
	if !cookies[0].HttpOnly {
		t.Fatal("auth cookie must be HttpOnly")
	}

	// The cookie should authenticate subsequent requests.
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.AddCookie(cookies[0])
	claims, err := ExtractTelegramUserFromRequest(req)
	if err != nil {
		t.Fatalf("extract from cookie: %v", err)
	}
	if claims.UserID != 7 {
		t.Fatalf("wrong user id from cookie: %d", claims.UserID)
	}

	clearRec := httptest.NewRecorder()
	ClearTelegramAuthCookie(clearRec)
	cleared := clearRec.Result().Cookies()
	if len(cleared) != 1 || cleared[0].MaxAge >= 0 {
		t.Fatalf("expected clearing cookie with negative MaxAge, got %+v", cleared)
	}
}

func TestExtractTelegramUserFromRequest_RejectsAdminToken(t *testing.T) {
	token, err := GenerateJWT(1, "admin")
	if err != nil {
		t.Fatalf("generate admin token: %v", err)
	}
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	if _, err := ExtractTelegramUserFromRequest(req); err == nil {
		t.Fatal("admin token must not be accepted as a Telegram user session")
	}
}
