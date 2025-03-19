package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/middlewares"
	"github.com/restaurent_table_booking/internal/services"
)

func Routes(server *gin.Engine) {
	// Generic
	server.GET("/", services.Home)

	// Authentication
	server.POST("/login", services.Login)
	server.POST("/register", services.Register)
	server.POST("/logout", services.Logout)
	server.GET("/me", middlewares.AuthMiddleware(), services.GetUserProfile)

	// Users routes (View - Add - Edit - Delete)

	AdminRoutes(server) // Các route yêu cầu quyền Admin
	OwnerRoutes(server)
	CustomerRoutes(server)

}
