package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/services"
)

func OwnerRoutes(server *gin.Engine) {
	// OWNER ROUTES
	owner := server.Group("/owners/:owner_id")
	{
		restaurant := owner.Group("/restaurants")
		{
			restaurant.GET("", services.GetAllOwnRestaurants)
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
			}
		}
	}
}
