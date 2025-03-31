package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/middlewares"
	"github.com/restaurent_table_booking/internal/services"
)

// Routes định nghĩa tất cả các route của ứng dụng.
func Routes(server *gin.Engine) {
	restaurant := server.Group("/restaurant")
	{
		restaurant.GET("/:restaurant_id", services.GetRestaurantByID)
		restaurant.GET("/:restaurant_id/tables", services.GetAllTables)
	}
	server.GET("/table/:table_id", services.GetTableByID)

	// Các route xác thực
	AuthRoutes(server)

	Guest(server)

	// Các route người dùng với quyền riêng
	User := server.Group("/")
	User.Use(middlewares.AuthMiddleware())
	{
		AdminRoutes(User)
		OwnerRoutes(User)
		CustomerRoutes(User)
		StaffRoutes(User)
	}
}
