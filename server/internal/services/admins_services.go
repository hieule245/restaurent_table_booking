package services

// import (
// 	"net/http"

// 	"github.com/gin-gonic/gin"
// 	"github.com/restaurent_table_booking/internal/models"
// )

// func AdminGetRestaurants(context *gin.Context) {
// 	res, err := models.GetAllRestaurants()
// 	if err != nil {
// 		context.JSON(http.StatusBadGateway, gin.H{"message": "Can't take any restaurants"})
// 		return
// 	}
// 	context.JSON(http.StatusOK, gin.H{"restaurants": res})
// }

// func AdminGetUsers(context *gin.Context) {
// 	context.JSON(200, gin.H{"message": "ok"})

// }

// func AdminGetUserByID(context *gin.Context) {
// 	context.JSON(200, gin.H{"message": "ok"})

// }

// func AdminGetOwners(context *gin.Context) {
// 	context.JSON(200, gin.H{"message": "ok"})

// }
// func AdminGetOwner(context *gin.Context) {
// 	context.JSON(200, gin.H{"message": "ok"})

// }
// func AdminGetCustomers(context *gin.Context) {
// 	context.JSON(200, gin.H{"message": "ok"})

// }
// func AdminGetCustomer(context *gin.Context) {
// 	context.JSON(200, gin.H{"message": "ok"})

// }
// func AdminGetRestaurant(context *gin.Context) {
// 	context.JSON(200, gin.H{"message": "ok"})

// }
// func AdminGetTables(context *gin.Context) {
// 	context.JSON(200, gin.H{"message": "ok"})

// }
// func AdminGetTable(context *gin.Context) {
// 	context.JSON(200, gin.H{"message": "ok"})

// }
