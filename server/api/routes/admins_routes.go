package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/middlewares"
	"github.com/restaurent_table_booking/internal/services"
)

// AdminRoutes định nghĩa các route dành cho Admin, bắt buộc phải đăng nhập và có quyền Admin.
func AdminRoutes(server *gin.Engine) {
	admin := server.Group("/admin")
	admin.Use(middlewares.AuthMiddleware()) // Xác thực user
	admin.Use(middlewares.AdminOnly)        // Kiểm tra quyền Admin

	{
		// Dashboard
		admin.GET("", services.StaticRevenueByAdmin)
		admin.GET("/top", services.GetTopRestaurantRevenuesByAdmin)

		// Danh sách người dùng
		admin.GET("/users", services.AdminGetUsers)
		admin.GET("/users/:user_id", services.AdminGetUser)
		admin.POST("/users/:user_id/lock", services.LockAccount)

		// Danh sách chủ nhà hàng
		admin.GET("/owners", services.AdminGetOwners)
		admin.GET("/owners/:owner_id", services.AdminGetOwner)

		// Danh sách khách hàng
		admin.GET("/customers", services.AdminGetCustomers)
		admin.GET("/customers/:customer_id", services.AdminGetCustomer)

		// Danh sách nhà hàng
		admin.GET("/restaurants", services.AdminGetRestaurants)
		admin.GET("/restaurants/:restaurant_id", services.AdminGetRestaurant)

		// Danh sachs đặt bàn
		admin.GET("/reservations", services.AdminGetReservation)

		// Danh sách bàn
		admin.GET("/tables", services.AdminGetTables)
		admin.GET("/tables/:table_id", services.AdminGetTable)

		// Tìm kiếm nhà hàng
		admin.GET("/restaurants/search", services.SearchRestaurants)
	}
}
