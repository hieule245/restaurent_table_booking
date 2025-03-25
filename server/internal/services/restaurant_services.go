package services

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/models"
)

// 📌 API tìm kiếm nhà hàng
func SearchRestaurants(c *gin.Context) {
	name := c.Query("name")
	location := c.Query("location")
	id, _ := strconv.Atoi(c.Query("id"))
	ownerID, _ := strconv.Atoi(c.Query("owner_id"))

	restaurants, err := models.SearchRestaurants(int64(id), name, location, ownerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, restaurants)
}
