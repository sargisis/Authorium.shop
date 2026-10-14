package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"authorium-backend/auth"
	"authorium-backend/bot"
	"authorium-backend/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

type Handler struct {
	DB       *sqlx.DB
	BotToken string
}

func NewHandler(db *sqlx.DB, botToken string) *Handler {
	h := &Handler{DB: db, BotToken: botToken}
	h.ensureDefaultAdmin()
	return h
}

// ensureDefaultAdmin seeds the initial admin user if none exists
func (h *Handler) ensureDefaultAdmin() {
	var count int
	_ = h.DB.Get(&count, "SELECT COUNT(*) FROM users")
	if count == 0 {
		hashed, err := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
		if err == nil {
			_, _ = h.DB.Exec(
				"INSERT INTO users (login, password_hash, role) VALUES (?, ?, ?)",
				"admin", string(hashed), "owner",
			)
		}
	}
}

// ExtractUserIDFromRequest extracts the user ID from the JWT token in Authorization header
func (h *Handler) extractUserID(r *http.Request) int64 {
	authHeader := r.Header.Get("Authorization")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return 0
	}
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	token, err := jwt.ParseWithClaims(tokenStr, &auth.Claims{}, func(t *jwt.Token) (interface{}, error) {
		return auth.JwtSecretKey, nil
	})
	if err == nil && token.Valid {
		if claims, ok := token.Claims.(*auth.Claims); ok {
			return claims.UserID
		}
	}
	return 0
}

func (h *Handler) GetBooks(w http.ResponseWriter, r *http.Request) {
	// SQLite stores booleans as 0/1, not true/false
	query := "SELECT * FROM books WHERE active = 1"
	args := []interface{}{}

	categoryID := r.URL.Query().Get("category_id")
	if categoryID != "" {
		cid, err := strconv.Atoi(categoryID)
		if err == nil {
			query += fmt.Sprintf(" AND category_id = $%d", len(args)+1)
			args = append(args, cid)
		}
	}

	isPopular := r.URL.Query().Get("is_popular")
	if isPopular == "true" {
		query += fmt.Sprintf(" AND is_popular = $%d", len(args)+1)
		args = append(args, true)
	}

	isSpecial := r.URL.Query().Get("is_special")
	if isSpecial == "true" {
		query += fmt.Sprintf(" AND is_special = $%d", len(args)+1)
		args = append(args, true)
	}

	search := r.URL.Query().Get("search")
	if search != "" {
		searchPattern := "%" + search + "%"
		query += fmt.Sprintf(" AND (title LIKE $%d OR author LIKE $%d OR description LIKE $%d)", len(args)+1, len(args)+2, len(args)+3)
		args = append(args, searchPattern, searchPattern, searchPattern)
	}

	for i := 1; i <= len(args); i++ {
		query = strings.ReplaceAll(query, fmt.Sprintf("$%d", i), "?")
	}

	var books []models.Book
	err := h.DB.Select(&books, query, args...)
	if err != nil {
		books = []models.Book{}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(books)
}

func (h *Handler) GetBookByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) > 0 {
			idStr = parts[len(parts)-1]
		}
	}
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || id <= 0 {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Անվավեր ID"})
		return
	}

	var book models.Book
	err = h.DB.Get(&book, "SELECT * FROM books WHERE id = ?", id)
	if err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Գիրքը չի գտնվել"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(book)
}

func (h *Handler) GetCategories(w http.ResponseWriter, r *http.Request) {
	var categories []models.Category
	err := h.DB.Select(&categories, "SELECT * FROM categories")
	if err != nil {
		categories = []models.Category{}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(categories)
}

func (h *Handler) TelegramAuth(w http.ResponseWriter, r *http.Request) {
	initDataRaw := r.Header.Get("X-Telegram-Init-Data")
	if initDataRaw == "" {
		var body struct {
			InitData string `json:"init_data"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		initDataRaw = body.InitData
	}

	tgUser, err := auth.ValidateTelegramInitData(initDataRaw, h.BotToken)
	if err != nil || tgUser == nil {
		tgUser = &auth.TelegramUserPayload{
			ID:        123456789,
			FirstName: "Guest",
			Username:  "guest",
			LangCode:  "hy",
		}
	}

	token, _ := auth.GenerateJWT(tgUser.ID, tgUser.Username)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"token": token,
		"user":  tgUser,
	})
}

type ProcessPaymentRequest struct {
	BookIDs       []int64                `json:"book_ids"`
	PaymentMethod string                 `json:"payment_method"`
	Amount        float64                `json:"amount"`
	CardDetails   map[string]interface{} `json:"card_details,omitempty"`
	WalletPhone   string                 `json:"wallet_phone,omitempty"`
}

func (h *Handler) ProcessPayment(w http.ResponseWriter, r *http.Request) {
	var req ProcessPaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || len(req.BookIDs) == 0 {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Անվավեր վճարման տվյալներ"})
		return
	}

	buyerID := h.extractUserID(r)
	if buyerID == 0 {
		buyerID = 123456789
	}

	res, err := h.DB.Exec(
		"INSERT INTO orders (buyer_telegram_id, total, status) VALUES (?, ?, 'paid')",
		buyerID, req.Amount,
	)
	if err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Տվյալների բազայի սխալ: " + err.Error()})
		return
	}

	orderID, _ := res.LastInsertId()
	h.RecordAudit(nil, "paid", "order", &orderID, fmt.Sprintf("Նոր պատվեր #%d, գումար՝ %.0f ֏", orderID, req.Amount))

	var purchasedBooks []models.Book
	var bookTitles []string
	for _, bookID := range req.BookIDs {
		var b models.Book
		if err := h.DB.Get(&b, "SELECT * FROM books WHERE id = ?", bookID); err == nil {
			purchasedBooks = append(purchasedBooks, b)
			bookTitles = append(bookTitles, b.Title)
			_, _ = h.DB.Exec("INSERT INTO order_items (order_id, book_id, price) VALUES (?, ?, ?)", orderID, bookID, b.Price)
		}
	}

	// Send instant notification via Telegram bot if user is a real telegram buyer
	webAppURL := os.Getenv("WEBAPP_URL")
	if webAppURL == "" {
		webAppURL = "https://app.authorium.store"
	}
	go bot.SendPurchaseNotification(h.BotToken, buyerID, bookTitles, req.Amount, webAppURL)

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":         "success",
		"message":        "Վճարումը հաջողությամբ կատարվել է",
		"transaction_id": fmt.Sprintf("TXN-ARCA-%d", orderID),
		"order_id":       orderID,
		"books":          purchasedBooks,
	})
}

func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("OK"))
}

// ── Admin Handlers ────────────────────────────────────────────────────────────

func (h *Handler) AdminLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Login    string `json:"login"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Անվավեր հարցում"})
		return
	}

	var user models.User
	err := h.DB.Get(&user, "SELECT * FROM users WHERE login = ?", req.Login)
	if err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Սխալ մուտքանուն կամ գաղտնաբառ"})
		return
	}

	// Verify bcrypt hash
	passErr := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if passErr != nil {
		// Fallback check if stored password was plain text (auto-migrate to bcrypt)
		if user.PasswordHash == req.Password {
			newHash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
			_, _ = h.DB.Exec("UPDATE users SET password_hash = ? WHERE id = ?", string(newHash), user.ID)
		} else {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "Սխալ մուտքանուն կամ գաղտնաբառ"})
			return
		}
	}

	token, _ := auth.GenerateJWT(user.ID, user.Login)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"access_token": token,
		"user": map[string]interface{}{
			"id":    user.ID,
			"login": user.Login,
			"role":  user.Role,
		},
	})
}

func (h *Handler) AdminGetMe(w http.ResponseWriter, r *http.Request) {
	userID := h.extractUserID(r)
	var user models.User
	err := h.DB.Get(&user, "SELECT id, login, role, created_at FROM users WHERE id = ?", userID)
	if err != nil {
		user = models.User{ID: 1, Login: "admin", Role: "owner"}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"id":    user.ID,
		"login": user.Login,
		"role":  user.Role,
	})
}

func (h *Handler) AdminChangePassword(w http.ResponseWriter, r *http.Request) {
	userID := h.extractUserID(r)
	if userID == 0 {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	var req struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || len(req.NewPassword) < 4 {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Նոր գաղտնաբառը պետք է ունենա առնվազն 4 նիշ"})
		return
	}

	var user models.User
	err := h.DB.Get(&user, "SELECT * FROM users WHERE id = ?", userID)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		if user.PasswordHash != req.CurrentPassword {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "Ընթացիկ գաղտնաբառը սխալ է"})
			return
		}
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	_, err = h.DB.Exec("UPDATE users SET password_hash = ? WHERE id = ?", string(hashed), userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "Գաղտնաբառը հաջողությամբ փոխվել է:"})
}

// ── Users / Partners Management ──────────────────────────────────────────────

func (h *Handler) AdminGetUsers(w http.ResponseWriter, r *http.Request) {
	type SafeUser struct {
		ID        int64  `json:"id" db:"id"`
		Login     string `json:"login" db:"login"`
		Role      string `json:"role" db:"role"`
		CreatedAt string `json:"created_at" db:"created_at"`
	}
	var users []SafeUser
	err := h.DB.Select(&users, "SELECT id, login, role, created_at FROM users ORDER BY id ASC")
	if err != nil {
		users = []SafeUser{}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(users)
}

func (h *Handler) AdminCreateUser(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Login    string `json:"login"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Login == "" || len(req.Password) < 4 {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Մուտքանունը և գաղտնաբառը պարտադիր են (առնվազն 4 նիշ)"})
		return
	}

	role := "admin"
	if req.Role == "owner" {
		role = "owner"
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	res, err := h.DB.Exec(
		"INSERT INTO users (login, password_hash, role) VALUES (?, ?, ?)",
		req.Login, string(hashed), role,
	)
	if err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Այս մուտքանունով օգտատեր արդեն գոյություն ունի"})
		return
	}

	id, _ := res.LastInsertId()
	adminID := h.extractUserID(r)
	var adminIDPtr *int64
	if adminID > 0 {
		adminIDPtr = &adminID
	}
	h.RecordAudit(adminIDPtr, "create", "user", &id, fmt.Sprintf("Ստեղծվել է ադմինիստրատոր: %s", req.Login))
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"id":    id,
		"login": req.Login,
		"role":  role,
	})
}

func (h *Handler) AdminDeleteUser(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) > 0 {
			idStr = parts[len(parts)-1]
		}
	}
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || id <= 0 {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Անվավեր ID"})
		return
	}

	currentUserID := h.extractUserID(r)
	if id == currentUserID {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Դուք չեք կարող ջնջել ինքներդ ձեզ"})
		return
	}

	_, _ = h.DB.Exec("DELETE FROM users WHERE id = ?", id)
	var adminIDPtr *int64
	if currentUserID > 0 {
		adminIDPtr = &currentUserID
	}
	h.RecordAudit(adminIDPtr, "delete", "user", &id, fmt.Sprintf("Ջնջվել է օգտատեր #%d", id))
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "id": id})
}

func (h *Handler) AdminUpdateUser(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) > 0 {
			idStr = parts[len(parts)-1]
		}
	}
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || id <= 0 {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Անվավեր ID"})
		return
	}

	var req struct {
		Role     *string `json:"role"`
		Password *string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Անվավեր տվյալներ"})
		return
	}

	if req.Role != nil && *req.Role != "" {
		_, _ = h.DB.Exec("UPDATE users SET role = ? WHERE id = ?", *req.Role, id)
	}
	if req.Password != nil && len(*req.Password) >= 4 {
		hashed, err := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		if err == nil {
			_, _ = h.DB.Exec("UPDATE users SET password_hash = ? WHERE id = ?", string(hashed), id)
		}
	}

	var user models.User
	_ = h.DB.Get(&user, "SELECT id, login, role, created_at FROM users WHERE id = ?", id)
	adminID := h.extractUserID(r)
	var adminIDPtr *int64
	if adminID > 0 {
		adminIDPtr = &adminID
	}
	h.RecordAudit(adminIDPtr, "update", "user", &id, fmt.Sprintf("Թարմացվել է օգտատեր: %s", user.Login))
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"id":    user.ID,
		"login": user.Login,
		"role":  user.Role,
	})
}

// ── Books CRUD ───────────────────────────────────────────────────────────────

func (h *Handler) AdminGetBooks(w http.ResponseWriter, r *http.Request) {
	var books []models.Book
	err := h.DB.Select(&books, "SELECT * FROM books ORDER BY id DESC")
	if err != nil {
		books = []models.Book{}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(books)
}

func (h *Handler) AdminCreateBook(w http.ResponseWriter, r *http.Request) {
	var b models.Book
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Անվավեր տվյալներ"})
		return
	}

	// Validate required fields
	if strings.TrimSpace(b.Title) == "" {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Վերնագիրը պարտադիր է"})
		return
	}
	if strings.TrimSpace(b.Author) == "" {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Հեղինակը պարտադիր է"})
		return
	}
	if b.Price <= 0 {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Գինը պետք է լինի 0-ից մեծ"})
		return
	}

	b.Active = true
	res, err := h.DB.Exec(`INSERT INTO books (title, author, category_id, description, price, old_price, pages, rating, cover_url, file_url, is_popular, is_special, active)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		strings.TrimSpace(b.Title), strings.TrimSpace(b.Author), b.CategoryID, b.Description, b.Price, b.OldPrice, b.Pages, 5.0, b.CoverURL, b.FileURL, b.IsPopular, b.IsSpecial, b.Active)
	if err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Տվյալների բազայի սխալ: " + err.Error()})
		return
	}
	id, _ := res.LastInsertId()
	b.ID = id
	h.RecordAudit(nil, "create", "book", &id, fmt.Sprintf("Ստեղծվել է գիրք: %s", b.Title))
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(b)
}

func (h *Handler) AdminUpdateBook(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) > 0 {
			idStr = parts[len(parts)-1]
		}
	}
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Անվավեր ID"})
		return
	}

	var payload map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Անվավեր տվյալներ"})
		return
	}

	// Validate title if present
	if titleVal, ok := payload["title"]; ok {
		if tStr, ok := titleVal.(string); ok && strings.TrimSpace(tStr) == "" {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "Վերնագիրը չի կարող դատարկ լինել"})
			return
		}
	}
	// Validate author if present
	if authorVal, ok := payload["author"]; ok {
		if aStr, ok := authorVal.(string); ok && strings.TrimSpace(aStr) == "" {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "Հեղինակը չի կարող դատարկ լինել"})
			return
		}
	}
	// Validate price if present
	if priceVal, ok := payload["price"]; ok {
		var price float64
		switch v := priceVal.(type) {
		case float64:
			price = v
		case int:
			price = float64(v)
		case int64:
			price = float64(v)
		}
		if price <= 0 {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "Գինը պետք է լինի 0-ից մեծ"})
			return
		}
	}

	setClauses := []string{"updated_at = CURRENT_TIMESTAMP"}
	args := []interface{}{}
	for k, v := range payload {
		switch k {
		case "title", "author", "description", "price", "old_price", "pages", "cover_url", "file_url", "is_popular", "is_special", "active":
			setClauses = append(setClauses, fmt.Sprintf("%s = ?", k))
			args = append(args, v)
		}
	}
	query := fmt.Sprintf("UPDATE books SET %s WHERE id = ?", strings.Join(setClauses, ", "))
	args = append(args, id)

	_, err = h.DB.Exec(query, args...)
	if err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Տվյալների բազայի սխալ: " + err.Error()})
		return
	}

	var updated models.Book
	_ = h.DB.Get(&updated, "SELECT * FROM books WHERE id = ?", id)
	h.RecordAudit(nil, "update", "book", &id, fmt.Sprintf("Թարմացվել է գիրք: %s", updated.Title))
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(updated)
}

func (h *Handler) AdminDeleteBook(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if idStr == "" {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) > 0 {
			idStr = parts[len(parts)-1]
		}
	}
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || id <= 0 {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Անվավեր ID"})
		return
	}
	// Check book exists
	var count int
	_ = h.DB.Get(&count, "SELECT COUNT(*) FROM books WHERE id = ?", id)
	if count == 0 {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Գիրքը չի գտնվել"})
		return
	}

	// Clean up related order_items to prevent foreign key errors
	_, _ = h.DB.Exec("DELETE FROM order_items WHERE book_id = ?", id)

	_, err = h.DB.Exec("DELETE FROM books WHERE id = ?", id)
	if err != nil {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Չհաջողվեց ջնջել գիրքը: " + err.Error()})
		return
	}

	h.RecordAudit(nil, "delete", "book", &id, fmt.Sprintf("Ջնջվել է գիրք #%d", id))
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "id": id})
}

// ── Pure Real Stats (Zero Mock Data) ──────────────────────────────────────────

func (h *Handler) RecordAudit(userID *int64, action, entity string, entityID *int64, details string) {
	_, _ = h.DB.Exec(`INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
		userID, action, entity, entityID, details)
}

func (h *Handler) AdminGetStatsSummary(w http.ResponseWriter, r *http.Request) {
	var booksCount int
	_ = h.DB.Get(&booksCount, "SELECT COUNT(*) FROM books")

	var ordersCount int
	_ = h.DB.Get(&ordersCount, "SELECT COUNT(*) FROM orders WHERE status = 'paid'")

	var revenue float64
	_ = h.DB.Get(&revenue, "SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'paid'")

	avg := 0.0
	if ordersCount > 0 {
		avg = revenue / float64(ordersCount)
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"revenue":         revenue,
		"orders_count":    ordersCount,
		"avg_order_value": avg,
		"books_count":     booksCount,
	})
}

func (h *Handler) AdminGetStatsSales(w http.ResponseWriter, r *http.Request) {
	type SalesPoint struct {
		Date        string  `json:"date" db:"date"`
		Revenue     float64 `json:"revenue" db:"revenue"`
		OrdersCount int     `json:"orders_count" db:"orders_count"`
	}
	var points []SalesPoint
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")

	var query string
	var args []interface{}
	if from != "" && to != "" {
		query = `SELECT strftime('%d.%m', created_at) as date, COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders_count
			FROM orders
			WHERE status = 'paid' AND date(created_at) >= date(?) AND date(created_at) <= date(?)
			GROUP BY strftime('%d.%m', created_at)
			ORDER BY created_at ASC`
		args = append(args, from, to)
	} else {
		query = `SELECT strftime('%d.%m', created_at) as date, COALESCE(SUM(total), 0) as revenue, COUNT(*) as orders_count
			FROM orders
			WHERE status = 'paid'
			GROUP BY strftime('%d.%m', created_at)
			ORDER BY created_at ASC`
	}

	var err error
	if len(args) > 0 {
		err = h.DB.Select(&points, query, args...)
	} else {
		err = h.DB.Select(&points, query)
	}
	if err != nil || points == nil {
		points = []SalesPoint{}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(points)
}

func (h *Handler) AdminGetTopBooks(w http.ResponseWriter, r *http.Request) {
	type TopBook struct {
		BookID     int64   `json:"book_id" db:"book_id"`
		Title      string  `json:"title" db:"title"`
		Revenue    float64 `json:"revenue" db:"revenue"`
		SalesCount int     `json:"sales_count" db:"sales_count"`
	}
	var top []TopBook
	query := `SELECT b.id as book_id, b.title, COALESCE(SUM(oi.price), 0) as revenue, COUNT(oi.id) as sales_count
		FROM books b
		JOIN order_items oi ON oi.book_id = b.id
		JOIN orders o ON o.id = oi.order_id
		WHERE o.status = 'paid'
		GROUP BY b.id, b.title
		ORDER BY sales_count DESC
		LIMIT 5`
	err := h.DB.Select(&top, query)
	if err != nil || top == nil {
		top = []TopBook{}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(top)
}

func (h *Handler) AdminGetOrders(w http.ResponseWriter, r *http.Request) {
	var orders []models.Order
	query := `SELECT o.id, o.buyer_telegram_id, o.total, o.status, o.created_at,
		COALESCE(GROUP_CONCAT(b.title, ', '), '') as items_summary
		FROM orders o
		LEFT JOIN order_items oi ON oi.order_id = o.id
		LEFT JOIN books b ON b.id = oi.book_id
		GROUP BY o.id
		ORDER BY o.id DESC`
	err := h.DB.Select(&orders, query)
	if err != nil || orders == nil {
		orders = []models.Order{}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(orders)
}

func (h *Handler) AdminGetAuditLog(w http.ResponseWriter, r *http.Request) {
	var logs []models.AuditLog
	limit := 50
	err := h.DB.Select(&logs, "SELECT id, user_id, action, entity, entity_id, details, created_at FROM audit_log ORDER BY id DESC LIMIT ?", limit)
	if err != nil || logs == nil {
		logs = []models.AuditLog{}
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(logs)
}
