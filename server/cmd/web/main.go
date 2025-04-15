package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/api/routes"
	"github.com/restaurent_table_booking/internal/cronjobs"
	"github.com/restaurent_table_booking/internal/db"
)

func main() {
	db.InitDB()

	server := gin.Default()

	server.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"}, // Chỉ cho phép frontend của bạn truy cập
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{
			"Origin", "Content-Length", "Content-Type", "Authorization", "X-Requested-With",
		},

		AllowCredentials: true, // Cho phép gửi cookie qua CORS
	}))
	// Check connect DB
	routes.RegisterStatusRoutes(server)
	// Đăng ký các routes
	routes.Routes(server) // Các route chung
	// Các route yêu cầu quyền Admin
	go cronjobs.CronCalculation()
	server.Run()
}
