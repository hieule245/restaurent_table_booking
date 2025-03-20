package routes

import (
	"github.com/restaurent_table_booking/internal/middlewares" // Import middleware

	"github.com/gin-gonic/gin"
)

func AdminRoutes(server *gin.Engine) {
	admin := server.Group("/admin")
	admin.Use(middlewares.AuthMiddleware()) // Bắt buộc phải đăng nhập trước
	admin.Use(middlewares.AdminOnly)        // Gắn middleware vào nhóm router admin

	{
		admin.GET("/users", AdminGetUsers)
		admin.GET("/users/:user_id", AdminGetUserByID)

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
}
