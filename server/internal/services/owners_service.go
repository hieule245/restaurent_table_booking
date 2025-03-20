package services

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/models"
)

func GetAllOwnRestaurants(context *gin.Context) {}
func GetRestaurantByID(context *gin.Context) {}
func CreateRestaurant(context *gin.Context) {
	var r models.Restaurant
	err := context.ShouldBindBodyWithJSON(&r)
	if err != nil {
		panic(err)
		context.JSON(http.StatusBadGateway, gin.H{"message": "Can't take any input information"})
		return
	}
	err = r.CreateRestaurant()
	if err != nil {
		context.JSON(http.StatusBadGateway, gin.H{"message": "Can't create restaurant"})
		return
	}
	context.JSON(http.StatusOK, gin.H{"message": "Create succesfully", "restaurant": r})
}
func EditRestaurant(context *gin.Context)   {}
func DeleteRestaurant(context *gin.Context) {}
func GetAllTables(context *gin.Context)     {}
func GetTableByID(context *gin.Context)     {}
func CreateTable(context *gin.Context)      {}
func EditTable(context *gin.Context)        {}
func DeleteTable(context *gin.Context)      {}
