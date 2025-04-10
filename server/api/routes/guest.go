package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/services"
)

func Guest(server *gin.Engine) {
	// Tìm kiếm bàn trống & thời gian đã đặt
	server.GET("/restaurants/:restaurant_id/tables/available", services.SearchAvailableTablesHandler)

	// Lay thoi gian booked cua ban`
	server.GET("/restaurants/:restaurant_id/tables/:table_id/booked-times", services.GetBookedTimesHandler)

	server.GET("/restaurants", services.GetAllRestaurants)

	// filter table with time start, time end, date
	server.GET("/restaurant/:restaurant_id/available-tables", services.GetAvailableTables)

}
