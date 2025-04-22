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
		restaurant := admin.Group("/restaurants/:restaurant_id")
		{
			restaurant.GET("", services.AdminGetRestaurant)
			restaurant.PUT("", services.AdminEditRestaurant)
			restaurant.POST("", services.AdminDeleteRestaurant)
			table := restaurant.Group("/tables")
			{
				table.GET("", services.AdminGetTables)
				table.PUT("/:table_id", services.AdminEditTable)
				table.POST("/:table_id", services.AdminDeleteTable)
			}
			staff := restaurant.Group("/staffs")
			{
				staff.GET("", services.AdminGetStaffs)
				staff.PUT("/:staff_id", services.AdminEditStaff)
				staff.POST("/:staff_id", services.AdminBanStaff)
			}
			reservation := restaurant.Group("/reservations")
			{
				reservation.GET("", services.ReservationEachRestaurant)
				reservation.POST("/edit", services.AdminEditReservations)
			}
		}

		// Danh sachs đặt bàn
		admin.GET("/reservations", services.AdminGetReservation)

		// Tìm kiếm nhà hàng
		admin.GET("/restaurants/search", services.SearchRestaurants)
	}
}
