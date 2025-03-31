package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/services"
)

func StaffRoutes(User *gin.RouterGroup) {
	staff := User.Group("/")
	{
		// router book table
		staff.POST("/restaurants/:restaurant_id/reservations", services.GetAllReservationOfRestaurant)
	}

}
