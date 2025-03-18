package routes

import (
	"github.com/restaurent_table_booking/internal/middlewares" // Import middleware
	"github.com/restaurent_table_booking/internal/services"

	"github.com/gin-gonic/gin"
)

func AdminRoutes(server *gin.Engine) {
	admin := server.Group("/admin")
	{
		admin.GET("/users", services.AdminGetUsers)
		admin.GET("/users/:user_id", services.AdminGetUserByID)

		admin.GET("/owners", services.AdminGetOwners)
		admin.GET("/owners/:owner_id", services.AdminGetOwner)

		admin.GET("/customers", services.AdminGetCustomers)
		admin.GET("/customers/:customer_id", services.AdminGetCustomer)

		admin.GET("/restaurants", services.AdminGetRestaurants)
		admin.GET("/restaurants/:restaurant_id", services.AdminGetRestaurant)

		admin.GET("/tables", services.AdminGetTables)
		admin.GET("/tables/:table_id", services.AdminGetTable)
	}
	admin.Use(middlewares.AdminOnly) // Gắn middleware vào nhóm router admin

	admin.GET("/dashboard", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Welcome to Admin Dashboard!"})
	})

	// ADMIN ROUTES

	// adminRoutes.GET("/dashboard", AdminDashboardHandler)
}
