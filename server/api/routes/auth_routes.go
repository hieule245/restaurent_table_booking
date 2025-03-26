package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/middlewares"
	"github.com/restaurent_table_booking/internal/services"
)

func AuthRoutes(server *gin.Engine) {
	server.POST("/login", services.Login)
	server.POST("/register", services.Register)
	server.POST("/forgot-password", services.ForgotPassword)
	server.POST("/verify-pin", services.CheckPin)
	server.POST("/resend-pin", services.ResendPin)
	server.POST("/reset-password", services.ResetPassword)
	server.POST("/logout", services.Logout)
	server.GET("/me", middlewares.AuthMiddleware(), services.GetUserProfile)
	server.POST("/me", middlewares.AuthMiddleware(), services.UpdateProfile)
	server.POST("/change-password", middlewares.AuthMiddleware(), services.ChangePassword)
}
