package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/middlewares"
	"github.com/restaurent_table_booking/internal/services"
)

// OwnerRoutes định nghĩa các route dành cho chủ sở hữu (owner) với xác thực và kiểm tra quyền riêng.
func OwnerRoutes(server *gin.Engine) {
	owner := server.Group("/owners/:owner_id")
	owner.Use(middlewares.AuthMiddleware()) // Yêu cầu đăng nhập
	owner.Use(middlewares.OwnerOnly)        // Chỉ cho phép owner truy cập

	{
		restaurant := owner.Group("/restaurants")
		{
			restaurant.GET("", services.GetAllRestaurants)
			restaurant.GET("/:restaurant_id", services.GetRestaurantByID)
			restaurant.POST("", services.CreateRestaurant)
			restaurant.PUT("/:restaurant_id", services.EditRestaurant)
			restaurant.DELETE("/:restaurant_id", services.DeleteRestaurant)

			// Các route liên quan đến bàn
			table := restaurant.Group("/:restaurant_id/tables")
			{
				table.GET("", services.GetAllTables)
				table.GET("/:table_id", services.GetTableByID)
				table.POST("", services.CreateTable)
				table.PUT("/:table_id", services.EditTable)
				table.DELETE("/:table_id", services.DeleteTable)
				// Tìm kiếm bàn
				table.GET("/search", services.SearchTables)
			}
		}

		// Các route cho quản lý nhân viên
		staff := owner.Group("/staffs")
		{
			staff.GET("", services.GetAllStaffs)
			staff.GET("/:staff_id", services.GetStaffByID)
			staff.POST("", services.CreateStaff)
			staff.PUT("/:staff_id", services.EditStaff)
			staff.DELETE("/:staff_id", services.DeleteStaff)
			// Tìm kiếm nhân viên
			staff.GET("/search", services.SearchStaffs)
		}
	}
}
