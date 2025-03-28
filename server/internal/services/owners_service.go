package services

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/models"
	"github.com/restaurent_table_booking/internal/utils"
)

// RESTAURANT HANDLER
func GetAllRestaurants(context *gin.Context) {
	restaurants, err := models.GetAllRestaurants()
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"restaurants": restaurants})
}

func GetAllOwnerRestaurants(context *gin.Context) {
	var acc models.Account
	token, err := context.Cookie("token")
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Can not get token from cookie"})
		context.Abort()
		return
	}
	claims, err := utils.ParseJWT(token)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Claim failse"})
		context.Abort()
		return
	}
	acc.Id = claims.UserID

	err, restaurant := models.GetRestaurantByOwnerID(acc.Id)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Can't collect data"})
		context.Abort()
		return
	}
	context.JSON(http.StatusOK, gin.H{"Owner restaurants": restaurant})
}

func GetRestaurantByID(context *gin.Context) {
	restaurantID := context.Param("restaurant_id") // Lấy ID từ URL
	restaurant, err := models.GetRestaurantByID(restaurantID)
	if err != nil {
		context.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"restaurant": restaurant})
}

func CreateRestaurant(context *gin.Context) {
	var r models.Restaurant
	err := context.ShouldBindBodyWithJSON(&r)
	token, err := context.Cookie("token")
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Can not get token from cookie"})
		context.Abort()
		return
	}
	claims, err := utils.ParseJWT(token)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Claim failse"})
		context.Abort()
		return
	}
	r.Owner_id = claims.UserID
	if err != nil {
		context.JSON(http.StatusBadGateway, gin.H{"message": "Can't take any input information"})
		return
	}
	err = r.CreateRestaurant()
	if err != nil {
		context.JSON(http.StatusBadGateway, gin.H{"message": err.Error()})
		return
	}
	context.JSON(http.StatusOK, gin.H{"message": "Create succesfully", "restaurant": r})
}

func EditRestaurant(context *gin.Context) {
	restaurantIDStr := context.Param("restaurant_id") // Lấy ID từ URL

	// Chuyển đổi restaurantID từ string -> int64
	restaurantID, err := strconv.ParseInt(restaurantIDStr, 10, 64)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid restaurant ID"})
		return
	}

	var updatedRestaurant models.Restaurant
	if err := context.ShouldBindJSON(&updatedRestaurant); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	updatedRestaurant.Id = restaurantID // Gán ID đã convert cho model
	err = updatedRestaurant.UpdateRestaurant()
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update restaurant", "error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Restaurant updated successfully", "restaurant": updatedRestaurant})
}
func DeleteRestaurant(context *gin.Context) {
	restaurantIDStr := context.Param("restaurant_id") // Lấy ID từ URL

	// 🔥 Chuyển đổi restaurantID từ string -> int64
	restaurantID, err := strconv.ParseInt(restaurantIDStr, 10, 64)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid restaurant ID"})
		return
	}

	// Gọi hàm xóa nhà hàng trong models
	err = models.DeleteRestaurantByID(restaurantID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to delete restaurant", "error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Restaurant deleted successfully"})
}

// TABLE HANDLER
func GetAllTables(context *gin.Context) {
	restaurantID, err := strconv.Atoi(context.Param("restaurant_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid restaurant ID"})
		return
	}

	tables, err := models.GetAllTables(restaurantID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tables"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"tables": tables})
}
func GetTableByID(context *gin.Context) {
	tableID, err := strconv.Atoi(context.Param("table_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid table ID"})
		return
	}

	table, err := models.GetTableByID(tableID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch table"})
		return
	}
	if table == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "Table not found"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"table": table})
}
func CreateTable(context *gin.Context) {
	restaurantID, err := strconv.Atoi(context.Param("restaurant_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid restaurant ID"})
		return
	}

	var table models.Table
	if err := context.ShouldBindJSON(&table); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	table.RestaurantID = restaurantID

	if err := table.CreateTable(); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.JSON(http.StatusCreated, gin.H{"message": "Table created", "table": table})
}
func EditTable(context *gin.Context) {
	tableID, err := strconv.Atoi(context.Param("table_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid table ID"})
		return
	}

	var table models.Table
	if err := context.ShouldBindJSON(&table); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	table.ID = tableID

	if err := table.UpdateTable(); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update table"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Table updated", "table": table})
}
func DeleteTable(context *gin.Context) {
	tableID, err := strconv.Atoi(context.Param("table_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid table ID"})
		return
	}

	if err := models.DeleteTable(tableID); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete table"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Table deleted"})
}
