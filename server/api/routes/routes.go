package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/middlewares"
	"github.com/restaurent_table_booking/internal/services"
)

// Routes định nghĩa tất cả các route của ứng dụng.
func Routes(server *gin.Engine) {
	server.GET("/", sayHi)
	// Các route liên quan đến owner: Tìm kiếm bàn trống & thời gian đã đặt
	server.GET("/restaurants/:restaurant_id/tables/available", services.SearchAvailableTablesHandler)

	server.GET("/restaurants/:restaurant_id/tables/:table_id/booked-times", services.GetBookedTimesHandler)

	// Các route công khai cho restaurant và table
	server.GET("/restaurants", services.GetAllRestaurants)

	// filter table with time start, time end, date
	server.GET("/restaurant/:restaurant_id/available-tables", services.GetAvailableTables)

	// router book table
	server.GET("/booking-history", services.GetBookingHistoryByCustomerID)
	// edit reservation for customer
	server.PUT("/reservation/:reservation_id", services.EditReservation)
	// delete reservation for customer
	server.DELETE("/reservation/:reservation_id", services.CancelReservation)

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
		// StaffRoutes(User)
	}
}

func welcome(context *gin.Context) {
	context.JSON(http.StatusOK, gin.H{"message": "Hello"})
}

func sayHi(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Hello World",
	})
}
