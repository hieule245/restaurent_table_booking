package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/middlewares"
	"github.com/restaurent_table_booking/internal/services"
)

// AdminRoutes định nghĩa các route dành cho Admin, bắt buộc phải đăng nhập và có quyền Admin.
func AdminRoutes(User *gin.RouterGroup) {
	admin := User.Group("/admin")
	admin.Use(middlewares.AdminOnly) // Kiểm tra quyền Admin
	{
		admin.GET("/users", services.AdminGetUsers)
		admin.GET("/users/:user_id", services.AdminGetUser)

		admin.GET("/owners", services.AdminGetOwners)
		admin.GET("/owners/:owner_id", services.AdminGetOwner)

		admin.GET("/customers", services.AdminGetCustomers)
		admin.GET("/customers/:customer_id", services.AdminGetCustomer)

		admin.GET("/restaurants", services.AdminGetRestaurants)
		admin.GET("/restaurants/:restaurant_id", services.AdminGetRestaurant)

		admin.GET("/tables", services.AdminGetTables)
		admin.GET("/tables/:table_id", services.AdminGetTable)

		// Tìm kiếm nhà hàng
		admin.GET("/restaurants/search", services.SearchRestaurants)
	}
}
