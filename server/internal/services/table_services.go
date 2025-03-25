package services

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/models"
)

// 📌 API tìm kiếm bàn ăn
func SearchTables(c *gin.Context) {
	name := c.Query("name")
	tableType := c.Query("type")
	seats, _ := strconv.Atoi(c.Query("seats"))
	// restaurantID, _ := strconv.Atoi(c.Query("restaurant_id"))

	// tables, err := models.SearchTables(name, tableType, seats, restaurantID)
	tables, err := models.SearchTables(name, tableType, seats, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tables)
}

// SearchAvailableTablesHandler xử lý API tìm kiếm bàn trống theo thời gian
// Yêu cầu query parameters:
// - restaurant_id: ID của nhà hàng
// - book_date: ngày đặt (YYYY-MM-DD)
// - desired_start: thời gian bắt đầu mong muốn (HH:MM)
// - desired_end: thời gian kết thúc mong muốn (HH:MM)
func SearchAvailableTablesHandler(c *gin.Context) {
	restaurantID, err := strconv.Atoi(c.Param("restaurant_id"))
	if err != nil || restaurantID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid restaurant_id"})
		return
	}

	bookDate := c.Query("book_date")
	desiredStart := c.Query("desired_start")
	desiredEnd := c.Query("desired_end")

	// Kiểm tra các giá trị bắt buộc
	if bookDate == "" || desiredStart == "" || desiredEnd == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "book_date, desired_start and desired_end are required"})
		return
	}

	tables, err := models.SearchAvailableTables(restaurantID, bookDate, desiredStart, desiredEnd)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"tables": tables})
}
