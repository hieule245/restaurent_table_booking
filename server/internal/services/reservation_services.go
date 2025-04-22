package services

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/db"
	"github.com/restaurent_table_booking/internal/models"
)

// GetBookedTimesHandler trả về danh sách các reservation (thời gian đã đặt) của bàn theo ngày
// Endpoint: GET /owners/:owner_id/restaurants/:restaurant_id/tables/:table_id/booked-times
// Query param: book_date (YYYY-MM-DD)
func GetBookedTimesHandler(c *gin.Context) {
	tableIDStr := c.Param("table_id")
	tableID, err := strconv.Atoi(tableIDStr)
	if err != nil || tableID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid table_id"})
		return
	}

	bookDate := c.Query("book_date")
	if bookDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "book_date is required"})
		return
	}

	reservations, err := models.GetReservationsByTableDate(tableID, bookDate)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"reservations": reservations})
}

// GetAvailableTables trả về danh sách bàn trống dựa trên khoảng thời gian đặt
func GetAvailableTables(context *gin.Context) {
	restaurantID := context.Param("restaurant_id")
	date := context.Query("date")            // Ví dụ: "2025-03-27"
	startTime := context.Query("time_start") // Ví dụ: "10:00:00"
	endTime := context.Query("time_end")     // Ví dụ: "12:00:00"

	// Kiểm tra các tham số bắt buộc
	if date == "" || startTime == "" || endTime == "" {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Missing required query parameters"})
		return
	}

	query := `
		SELECT t.id, t.name, t.type, t.seats, t.description, t.restaurant_id
		FROM tables t
		WHERE t.restaurant_id = ?
		AND t.id NOT IN (
			SELECT r.table_id 
			FROM reservations r
			WHERE r.book_date = ?
			AND (r.time_start < ? AND r.time_end > ?)
		)
	`
	rows, err := db.DB.Query(query, restaurantID, date, endTime, startTime)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var availableTables []models.Table
	for rows.Next() {
		var table models.Table
		if err := rows.Scan(&table.ID, &table.Name, &table.Type, &table.Seats, &table.Description, &table.RestaurantID); err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		availableTables = append(availableTables, table)
	}

	context.JSON(http.StatusOK, gin.H{"tables": availableTables})
}

// func GetAllReservationOfRestaurant(context *gin.Context) {
// 	restaurant_id, err := strconv.ParseInt(context.Param("restaurant_id"), 10, 64)
// 	if err != nil {
// 		context.JSON(http.StatusInternalServerError, gin.H{"error": "can't convert to int 64"})
// 		return
// 	}

// 	tables, err := models.GetAllTables(restaurant_id)
// 	if err != nil {
// 		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tables"})
// 		return
// 	}

// }
