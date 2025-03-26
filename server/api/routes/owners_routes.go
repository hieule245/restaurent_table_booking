package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/middlewares"
	"github.com/restaurent_table_booking/internal/services"
)

func OwnerRoutes(server *gin.Engine) {
	// OWNER ROUTES
	owner := server.Group("/owners/:owner_id")
	owner.Use(middlewares.AuthMiddleware()) // Bắt buộc phải đăng nhập trước
	owner.Use(middlewares.OwnerOnly)        // Gắn middleware vào nhóm router admin

	{
		restaurant := owner.Group("/restaurants")
		{
			restaurant.GET("", services.GetAllOwnerRestaurants)
			restaurant.GET("/:restaurant_id", services.GetRestaurantByID)
			restaurant.POST("", services.CreateRestaurant)
			restaurant.PUT("/:restaurant_id", services.EditRestaurant)
			restaurant.DELETE("/:restaurant_id", services.DeleteRestaurant)

			table := restaurant.Group("/:restaurant_id/tables")
			{
				table.GET("", services.GetAllTables)
				table.GET("/:table_id", services.GetTableByID)
				table.POST("", services.CreateTable)
				table.PUT("/:table_id", services.EditTable)
				table.DELETE("/:table_id", services.DeleteTable)
				table.GET("/search", services.SearchTables) // 🔍 Tìm kiếm bàn ăn
			}
		}
		staff := owner.Group("/staffs")
		{
			staff.GET("", services.GetAllStaffs)
			staff.GET("/:staff_id", services.GetStaffByID)
			staff.POST("", services.CreateStaff)
			staff.PUT("/:staff_id", services.EditStaff)
			staff.DELETE("/:staff_id", services.DeleteStaff)
			staff.GET("/search", services.SearchStaffs) // 🔍 Tìm kiếm nhân viên
		}
	}

}
