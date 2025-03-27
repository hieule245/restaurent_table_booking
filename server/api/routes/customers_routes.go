package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/services"
)

// CustomerRoutes định nghĩa các route cho khách hàng (customer)
// Các route này thường không cần middleware (hoặc có thể áp dụng AuthMiddleware nếu cần).
func CustomerRoutes(r *gin.Engine) {
	// Route tạo booking theo nhà hàng
	restaurants := r.Group("/restaurants")
	{
		restaurants.POST("/:restaurant_id/bookings", services.CreateBooking)
	}

	// Route lấy danh sách booking của khách hàng
	// customers := r.Group("/customers")
	// {
	// 	customers.GET("/:customer_id/bookings", services.GetBookingHistoryByCustomerID)
	// }
}
