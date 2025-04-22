package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/middlewares"
	"github.com/restaurent_table_booking/internal/services"
)

// OwnerRoutes định nghĩa các route dành cho chủ sở hữu (owner) với xác thực và kiểm tra quyền riêng.
func OwnerRoutes(user *gin.RouterGroup) {
	owner := user.Group("/owners/:owner_id")
	owner.Use(middlewares.AuthMiddleware()) // Yêu cầu đăng nhập
	owner.Use(middlewares.OwnerOnly)        // Chỉ cho phép owner truy cập
	owner.GET("", services.StaticRevenue)
	owner.GET("/static", services.GetNumberBookingEachRole)
	owner.GET("/top", services.GetTopRestaurantRevenues)
	{
		reservation := owner.Group("/reservations")
		{
			reservation.GET("", services.GetAllReservations)
			reservation.POST("finish_booking", services.EndingUsingTable)
		}
		restaurant := owner.Group("/restaurants")
		{
			restaurant.GET("", services.GetAllOwnerRestaurants)
			restaurant.GET("/:restaurant_id", services.GetRestaurantByID)
			restaurant.POST("", services.CreateRestaurant)
			restaurant.PUT("/:restaurant_id", services.EditRestaurant)
			restaurant.POST("/:restaurant_id", services.DeleteRestaurant)
			restaurant.GET("/:restaurant_id/reservations", services.GetReservationsByRestaurants)

			// Các route liên quan đến bàn
			table := restaurant.Group("/:restaurant_id/tables")
			{
				table.GET("", services.GetAllTables)
				table.GET("/:table_id", services.GetTableByID)
				table.POST("", services.CreateTable)
				table.PUT("/:table_id", services.EditTable)
				table.POST("/:table_id", services.DeleteTable)
				// Tìm kiếm bàn
				table.GET("/search", services.SearchTables)
			}
			staff := owner.Group("/:restaurant_id/staffs")
			{
				staff.GET("", services.GetStaffByRestaurantId)
				staff.GET("/:staff_id", services.GetStaffByID)
				staff.POST("", services.CreateStaff)
				staff.PUT("/:staff_id", services.EditStaff)
				staff.DELETE("/:staff_id", services.DeleteStaff)
				staff.POST("/:staff_id", services.LockStaff)
				staff.GET("/search", services.SearchStaffs) // 🔍 Tìm kiếm nhân viên
			}
		}
	}
}
