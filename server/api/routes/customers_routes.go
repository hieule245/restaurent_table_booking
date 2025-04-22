package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/services"
)

func CustomerRoutes(User *gin.RouterGroup) {
	customer := User.Group("/")
	{
		customer.POST("/restaurants/:restaurant_id/bookings", services.CreateBooking)
		// router book table
		// edit reservation for customer
		customer.PUT("/reservation/:reservation_id", services.EditReservation)
		// delete reservation for customer
		customer.DELETE("/reservation/:reservation_id", services.CancelReservation)
	}

}
