package bot

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

type Update struct {
	UpdateID int `json:"update_id"`
	Message  *struct {
		MessageID int `json:"message_id"`
		From      struct {
			ID        int64  `json:"id"`
			FirstName string `json:"first_name"`
			Username  string `json:"username"`
		} `json:"from"`
		Chat struct {
			ID int64 `json:"id"`
		} `json:"chat"`
		Text string `json:"text"`
	} `json:"message"`
}

func StartBot(token string, webAppURL string) {
	if token == "" || token == "dummy_token" {
		log.Println("Bot token not configured, skipping bot listener")
		return
	}

	log.Println("Telegram Bot background listener starting...")

	// Also set the Chat Menu Button via Telegram Bot API directly!
	setMenuBtnURL := fmt.Sprintf("https://api.telegram.org/bot%s/setChatMenuButton", token)
	menuPayload := map[string]interface{}{
		"menu_button": map[string]interface{}{
			"type": "web_app",
			"text": "📚 Բացել խանութը",
			"web_app": map[string]string{
				"url": webAppURL,
			},
		},
	}
	menuBody, _ := json.Marshal(menuPayload)
	_, _ = http.Post(setMenuBtnURL, "application/json", bytes.NewBuffer(menuBody))
	log.Printf("Configured Telegram Chat Menu Button with URL: %s", webAppURL)

	offset := 0
	client := &http.Client{Timeout: 35 * time.Second}

	for {
		getUpdatesURL := fmt.Sprintf("https://api.telegram.org/bot%s/getUpdates?offset=%d&timeout=30", token, offset)
		resp, err := client.Get(getUpdatesURL)
		if err != nil {
			time.Sleep(3 * time.Second)
			continue
		}

		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		var result struct {
			Ok     bool     `json:"ok"`
			Result []Update `json:"result"`
		}

		if err := json.Unmarshal(body, &result); err != nil || !result.Ok {
			time.Sleep(3 * time.Second)
			continue
		}

		for _, update := range result.Result {
			offset = update.UpdateID + 1

			if update.Message != nil {
				chatID := update.Message.Chat.ID
				sendReplyWithWebApp(token, chatID, webAppURL)
			}
		}
	}
}

func sendReplyWithWebApp(token string, chatID int64, webAppURL string) {
	sendURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)

	payload := map[string]interface{}{
		"chat_id": chatID,
		"text":    "Բարի գալուստ *Authorium.store* գրախանութ! 📚✨\n\nՍեղմեք կոճակը՝ գրքերի տեսականին դիտելու համար։",
		"parse_mode": "Markdown",
		"reply_markup": map[string]interface{}{
			"inline_keyboard": [][]interface{}{
				{
					map[string]interface{}{
						"text": "🛍 Բացել խանութը (Authorium.store)",
						"web_app": map[string]string{
							"url": webAppURL,
						},
					},
				},
			},
		},
	}

	data, _ := json.Marshal(payload)
	_, _ = http.Post(sendURL, "application/json", bytes.NewBuffer(data))
}

func SendPurchaseNotification(token string, chatID int64, bookTitles []string, total float64, webAppURL string) {
	if token == "" || token == "dummy_token" || chatID <= 0 {
		return
	}
	sendURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)
	titlesList := strings.Join(bookTitles, ", ")
	text := fmt.Sprintf("🎉 *Շնորհավորում ենք գնման կապակցությամբ!*\n\nԴուք հաջողությամբ գնել եք:\n📖 *%s*\n\nԸնդհանուր գումարը: *%.0f ֏*\n\nԳիրքն արդեն հասանելի է ձեր գրադարանում:", titlesList, total)

	payload := map[string]interface{}{
		"chat_id":    chatID,
		"text":       text,
		"parse_mode": "Markdown",
		"reply_markup": map[string]interface{}{
			"inline_keyboard": [][]interface{}{
				{
					map[string]interface{}{
						"text": "📖 Կարդալ գիրքը",
						"web_app": map[string]string{
							"url": webAppURL + "/profile?tab=purchased",
						},
					},
				},
			},
		},
	}

	data, _ := json.Marshal(payload)
	_, _ = http.Post(sendURL, "application/json", bytes.NewBuffer(data))
}
