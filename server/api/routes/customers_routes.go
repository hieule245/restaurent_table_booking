package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/services"
)

func CustomerRoutes(server *gin.Engine) {
	// CUSTOMER ROUTES
	server.POST("/restaurants/:restaurant_id/bookings", services.CreateBooking)
	server.GET("/customers/:customer_id/bookings", services.GetBookingsByCustomerID)
}
