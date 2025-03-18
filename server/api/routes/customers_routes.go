package routes

import "github.com/gin-gonic/gin"

func CustomerRoutes(server *gin.Engine) {
	// CUSTOMER ROUTES
	server.POST("/restaurants/:restaurant_id/bookings", CreateBooking)
	server.GET("/customers/:customer_id/bookings", GetBookingsByCustomerID)
}

func CreateBooking(context *gin.Context) {

}
func GetBookingsByCustomerID(context *gin.Context) {

}
