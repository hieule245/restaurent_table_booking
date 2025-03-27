package services

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
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
	fmt.Println("bookDate: ", bookDate)

	reservations, err := models.GetReservationsByTableDate(tableID, bookDate)
	if err != nil {
		fmt.Println(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"reservations": reservations})
}
