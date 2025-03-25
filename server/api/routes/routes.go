package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/services"
)

func Routes(server *gin.Engine) {
	server.GET("/owners/:owner_id/restaurants/:restaurant_id/tables/available", services.SearchAvailableTablesHandler)
	server.GET("/owners/:owner_id/restaurants/:restaurant_id/tables/:table_id/booked-times", services.GetBookedTimesHandler)
	server.GET("/restaurants", services.GetAllRestaurants)
	// Authentication routes
	AuthRoutes(server)

	// Users routes (View - Add - Edit - Delete)
	AdminRoutes(server) // Các route yêu cầu quyền Admin
	OwnerRoutes(server)
	CustomerRoutes(server)

}
