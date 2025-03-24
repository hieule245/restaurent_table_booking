package services

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/models"
)

// 📌 Tạo đơn đặt bàn
func CreateBooking(context *gin.Context) {
	restaurantID, err := strconv.Atoi(context.Param("restaurant_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid restaurant ID"})
		return
	}

	var booking models.Booking
	if err := context.ShouldBindJSON(&booking); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Kiểm tra nhà hàng có tồn tại không
	exists, err := models.RestaurantExists(restaurantID)
	if err != nil || !exists {
		context.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found"})
		return
	}

	// Kiểm tra bàn có thuộc nhà hàng không
	exists, err = models.TableExistsInRestaurant(booking.TableID, restaurantID)
	if err != nil || !exists {
		context.JSON(http.StatusNotFound, gin.H{"error": "Table not found in this restaurant"})
		return
	}

	// Kiểm tra duplicate booking: nếu đã có booking cho cùng bàn, ngày và giờ bắt đầu/kết thúc
	err = booking.Check()
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Thêm booking vào database
	bookingID, err := booking.Create()
	booking.ID = int(bookingID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.JSON(http.StatusCreated, gin.H{"message": "Booking created successfully", "booking": booking})
}

// 📌 Lấy danh sách đặt bàn của khách hàng
func GetBookingsByCustomerID(context *gin.Context) {
	customerID, err := strconv.Atoi(context.Param("customer_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	bookings, err := models.GetBookingsByCustomer(customerID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"customer_id": customerID, "bookings": bookings})
}
