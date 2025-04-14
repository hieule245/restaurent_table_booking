package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/services"
)

// StaffRoutes định nghĩa các route dành cho nhân viên với xác thực và kiểm tra quyền riêng.
func StaffRoutes(server *gin.Engine) {
	staff := server.Group("/staff")
	staff.GET("/restaurant", services.GetRestaurantByStaffID)                       // Lấy thông tin nhà hàng của nhân viên
	staff.GET("/:restaurant_id/tables", services.GetTablesByRestaurantID)           // Lấy thông tin bàn ăn
	staff.GET("/:restaurant_id/reservation", services.GetReservationByRestaurantID) // Lấy thông tin đặt bàn
	staff.POST("/:restaurant_id/reservation/finish_booking", services.EndingUsingTable)
}
