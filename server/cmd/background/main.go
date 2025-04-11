package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/restaurent_table_booking/api/routes"
	"github.com/restaurent_table_booking/internal/cronjobs"
	"github.com/restaurent_table_booking/internal/db"
)

func main() {
	db.InitDB()

	server := gin.Default()

	server.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://100.102.105.126:3000",
			"http://192.168.16.55:3000",
			"http://127.0.0.1:3000",
		}, AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	routes.Routes(server)

	server.GET("/ws", handlerConnections)

	go cronjobs.CronCalculation()
	server.Run(":8080")
}

// WebSocket

type Client struct {
	UserID   int
	UserRole string
	Conn     *websocket.Conn
}

type Message struct {
	SenderID     int    `json:"sender_id"`
	SenderRole   string `json:"sender_role"`
	ReceiverID   int    `json:"receiver_id"`
	ReceiverRole string `json:"receiver_role"`
	Content      string `json:"content"`
}

var (
	clients     = make(map[string]*Client) // userID → client
	clientsLock sync.Mutex
	upgrader    = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

func handlerConnections(c *gin.Context) {
	userIDStr := c.Query("user_id") // Lấy từ query, bạn có thể dùng cookie/session
	userID, err := strconv.Atoi(userIDStr)
	if err != nil || userID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
		return
	}

	userRole := c.Query("user_role") // Lấy từ query, bạn có thể dùng cookie/session

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("WebSocket upgrade failed:", err)
		return
	}
	defer conn.Close()

	client := &Client{
		UserID:   userID,
		UserRole: userRole,
		Conn:     conn,
	}

	clientsLock.Lock()
	clientKey := fmt.Sprintf("%d:%s", userID, userRole)
	clients[clientKey] = client
	clientsLock.Unlock()

	fmt.Println("User connected:", userID)

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			fmt.Println("Error reading json:", err)
			break
		}

		fmt.Printf("Received from %d (%s) to %d (%s): %s\n", msg.SenderID, msg.SenderRole, msg.ReceiverID, msg.ReceiverRole, msg.Content)

		// Gửi cho người nhận
		clientsLock.Lock()
		receiverKey := fmt.Sprintf("%d:%s", msg.ReceiverID, msg.ReceiverRole)
		if receiver, ok := clients[receiverKey]; ok {
			data, _ := json.Marshal(msg)
			receiver.Conn.WriteMessage(websocket.TextMessage, data)
		}
		clientsLock.Unlock()
	}

	// Cleanup
	clientsLock.Lock()
	delete(clients, string(userID)+userRole)
	clientsLock.Unlock()

	fmt.Println("User disconnected:", userID)
}
