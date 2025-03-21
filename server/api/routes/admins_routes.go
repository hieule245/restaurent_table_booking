package routes

import (
	"net/http"

	"github.com/restaurent_table_booking/internal/middlewares" // Import middleware
	"github.com/restaurent_table_booking/internal/models"

	"github.com/gin-gonic/gin"
)

func AdminRoutes(server *gin.Engine) {
	admin := server.Group("/admin")
	admin.Use(middlewares.AuthMiddleware()) // Bắt buộc phải đăng nhập trước
	admin.Use(middlewares.AdminOnly)        // Gắn middleware vào nhóm router admin

	{
		admin.GET("/users", AdminGetUsers)
		admin.GET("/users/:user_id", AdminGetUser)

		admin.GET("/owners", AdminGetOwners)
		admin.GET("/owners/:owner_id", AdminGetOwner)

		admin.GET("/customers", AdminGetCustomers)
		admin.GET("/customers/:customer_id", AdminGetCustomer)

		admin.GET("/restaurants", AdminGetRestaurants)
		admin.GET("/restaurants/:restaurant_id", AdminGetRestaurant)

		admin.GET("/tables", AdminGetTables)
		admin.GET("/tables/:table_id", AdminGetTable)
	}
	admin.Use(middlewares.AdminOnly) // Gắn middleware vào nhóm router admin

	admin.GET("/dashboard", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Welcome to Admin Dashboard!"})
	})

	// ADMIN ROUTES

	// adminRoutes.GET("/dashboard", AdminDashboardHandler)
}

func AdminGetUsers(context *gin.Context) {
	res, err := models.GetAllRestaurants()
	if err != nil {
		context.JSON(http.StatusBadGateway, gin.H{"message": "Can't take any restaurants"})
		return
	}
	context.JSON(http.StatusOK, gin.H{"restaurants": res})
}

func AdminGetUser(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}
func AdminGetOwners(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}
func AdminGetOwner(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}
func AdminGetCustomers(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}
func AdminGetCustomer(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}
func AdminGetRestaurants(context *gin.Context) {
	var res []models.Restaurant
	res, err := models.GetAllRestaurants()
	if err != nil {
		context.JSON(http.StatusBadGateway, gin.H{"message": "Can't take any restaurants"})
		return
	}
	context.JSON(http.StatusOK, gin.H{"restaurants": res})

}
func AdminGetRestaurant(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}
func AdminGetTables(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}
func AdminGetTable(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}
