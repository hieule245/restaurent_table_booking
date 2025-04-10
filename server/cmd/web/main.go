package main

import (
	"fmt"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/api/routes"
	"github.com/restaurent_table_booking/internal/db"
)

func main() {
	db.InitDB()

	server := gin.Default()

	server.Use(cors.New(cors.Config{
		// Chỉ cho phép frontend truy cập
		AllowOrigins: []string{"https://desktop-b0d0j2q.tail04954f.ts.net"},
		// AllowOriginFunc: func(origin string) bool {
		// 	fmt.Println("Incoming Origin:", origin)
		// 	return strings.Contains(origin, "ngrok-free.app")
		// },
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true, // Cho phép gửi cookie qua CORS
	}))

	// Đăng ký các routes
	routes.Routes(server) // Các route chung
	// Các route yêu cầu quyền Admin

	server.Run()
	// time
	timeN := "2000-03-17 8:00:00"
	var timeN1 time.Time
	timeN1, _ = time.Parse("2006-01-02 15:00:00", timeN)
	fmt.Print(timeN1)
}
