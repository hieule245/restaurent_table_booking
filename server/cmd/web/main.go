package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/restaurent_table_booking/api/routes"
	"github.com/restaurent_table_booking/internal/cronjobs"
	"github.com/restaurent_table_booking/internal/db"
)

type Client struct {
	ID   int
	Role string
	Conn *websocket.Conn
	Send chan []byte
}

var clients = make(map[string]*Client) // key: fmt.Sprintf("%d-%s", ID, Role)
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("No .env file found or failed to load")
	}
	db.InitDB()

	server := gin.Default()

	server.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"https://giolang.cloud.runsystem.site",
			"http://localhost:3000",
		},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{
			"Origin", "Content-Length", "Content-Type", "Authorization", "X-Requested-With",
		},
		AllowCredentials: true,
	}))

	server.GET("/sayhi", func(context *gin.Context) { context.JSON(200, gin.H{"response": "Hello"}) })
	server.GET("/", func(context *gin.Context) { context.JSON(200, gin.H{"response": "Hi, web is on"}) })
	server.GET("/ws", chatHandler)

	routes.RegisterStatusRoutes(server)
	routes.Routes(server)
	go cronjobs.CronCalculation()
	go AutoUpdateReservationStatuses()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	server.Run(":" + port)
}

func AutoUpdateReservationStatuses() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		<-ticker.C
		rows, err := db.DB.Query(`SELECT id, time_start, time_end, status FROM reservations`)
		if err != nil {
			log.Println("Failed to fetch reservations:", err)
			continue
		}
		defer rows.Close()

		now := time.Now().Unix()
		hasUpdated := false

		for rows.Next() {
			var id int
			var timeStartStr, timeEndStr string
			var status int

			if err := rows.Scan(&id, &timeStartStr, &timeEndStr, &status); err != nil {
				log.Println("Row scan error:", err)
				continue
			}

			today := time.Now().Format("2006-01-02")
			startFull, _ := time.Parse("2006-01-02 15:04:05", today+" "+timeStartStr)
			endFull, _ := time.Parse("2006-01-02 15:04:05", today+" "+timeEndStr)

			startSeconds := startFull.Unix()
			endSeconds := endFull.Unix()

			var newStatus int = -1

			if status == 1 && now >= startSeconds {
				newStatus = 0
			} else if status == 2 {
				if now >= startSeconds && now < endSeconds {
					newStatus = 3
				} else if now >= endSeconds {
					newStatus = 4
				}
			} else if status == 3 && now >= endSeconds {
				newStatus = 4
			}

			if newStatus != -1 {
				updateStatusByAPI(id, newStatus)
				hasUpdated = true
			}
		}

		if hasUpdated {
			log.Println("Đã cập nhật reservation")
		} else {
			log.Println("Đã check và không có cập nhật")
		}
	}
}

func updateStatusByAPI(reservationID int, newStatus int) {
	url := fmt.Sprintf("http://localhost:8080/api/admin/reservation/edit/%d", reservationID)
	payload := map[string]interface{}{"status": newStatus}
	jsonData, _ := json.Marshal(payload)

	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Println("Failed to create request:", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Failed to send update status:", err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("Failed update response: %d - %s\n", resp.StatusCode, string(body))
	}
}

func chatHandler(c *gin.Context) {
	userIDStr := c.Query("user_id")
	role := c.Query("user_role")

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}

	clientKey := fmt.Sprintf("%d-%s", userID, role)
	client := &Client{
		ID:   userID,
		Role: role,
		Conn: conn,
		Send: make(chan []byte),
	}

	clients[clientKey] = client
	go readMessages(client)
	go writeMessages(client)
}

func readMessages(client *Client) {
	defer func() {
		client.Conn.Close()
		delete(clients, fmt.Sprintf("%d-%s", client.ID, client.Role))
	}()

	for {
		_, msg, err := client.Conn.ReadMessage()
		if err != nil {
			break
		}

		var payload struct {
			SenderID     int    `json:"sender_id"`
			SenderRole   string `json:"sender_role"`
			ReceiverID   int    `json:"receiver_id"`
			ReceiverRole string `json:"receiver_role"`
			Content      string `json:"content"`
		}

		if err := json.Unmarshal(msg, &payload); err != nil {
			continue
		}

		receiverKey := fmt.Sprintf("%d-%s", payload.ReceiverID, payload.ReceiverRole)
		if receiver, ok := clients[receiverKey]; ok {
			receiver.Send <- msg
		}

		// senderKey := fmt.Sprintf("%d-%s", payload.SenderID, payload.SenderRole)
		// if sender, ok := clients[senderKey]; ok {
		// 	sender.Send <- msg
		// }
	}
}

func writeMessages(client *Client) {
	for msg := range client.Send {
		if err := client.Conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
}
