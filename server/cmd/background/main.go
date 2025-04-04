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
		// http://localhost:3000
		AllowOrigins:     []string{"https://gmo-h110m-h.tail04954f.ts.net"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true, // Cho phép gửi cookie qua CORS
	}))

	// Đăng ký các routes
	routes.Routes(server) // Các route chung
	// Các route yêu cầu quyền Admin
	go cronjobs.CronCalculation()
	server.Run()
}
