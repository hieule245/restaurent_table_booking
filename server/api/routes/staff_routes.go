package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/services"
)

// StaffRoutes định nghĩa các route dành cho nhân viên với xác thực và kiểm tra quyền riêng.
func StaffRoutes(User *gin.RouterGroup) {
	staff := User.Group("/staff")
	staff.GET("/restaurant", services.GetRestaurantByStaffID) // Lấy thông tin nhà hàng của nhân viên
	staff.GET("/:restaurant_id/tables", services.GetTablesByRestaurantID)
	staff.POST("/:restaurant_id/bookings", services.CreateBookingByStaff)
	staff.GET("/:restaurant_id/reservation", services.GetReservationByRestaurantID)
	staff.POST("/:restaurant_id/reservation/finish_booking", services.EndingUsingTable)
	reservation := staff.Group("/reservations")
	{
		reservation.POST("/:reservation_id/confirm_booking", services.ConfirmBookingFromRestaurant)
		reservation.POST("/:reservation_id/cancel_booking", services.CancelBookingFromRestaurant)
	}
}
