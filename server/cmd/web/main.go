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
		// AllowAllOrigins: true,
		AllowOrigins: []string{
			"https://giolang.cloud.runsystem.site",
			"http://localhost:3000",
		},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{
			"Origin", "Content-Length", "Content-Type", "Authorization", "X-Requested-With",
		},

		AllowCredentials: true, // Cho phép gửi cookie qua CORS
	}))
	server.GET("/sayhi", func(context *gin.Context) { context.JSON(200, gin.H{"response": "Hello"}) })
	server.GET("/", func(context *gin.Context) { context.JSON(200, gin.H{"response": "Hi, web is on"}) })

	// Check connect DB
	routes.RegisterStatusRoutes(server)
	// Đăng ký các routes
	routes.Routes(server) // Các route chung
	// Các route yêu cầu quyền Admin
	go cronjobs.CronCalculation()
	server.Run()
}
