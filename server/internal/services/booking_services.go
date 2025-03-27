package services

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/models"
)

// BookingRequest định nghĩa dữ liệu nhận từ client để tạo booking
type BookingRequest struct {
	NumberOfCustomer string  `json:"numberOfCustomer"`
	BookDate         string  `json:"book_date"`
	TimeStart        string  `json:"time_start"`
	TimeEnd          string  `json:"time_end"`
	ActualEnd        string  `json:"actual_end"`
	Price            float64 `json:"price"`
	CustomerEmail    string  `json:"customer_email"`
	TableID          int     `json:"table_id"`
	CustomerID       int     `json:"customer_id"`
	Status           int     `json:"status"`
}

// CreateBooking xử lý tạo booking trực tiếp từ request
func CreateBooking(c *gin.Context) {
	restaurantID, err := strconv.Atoi(c.Param("restaurant_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid restaurant ID"})
		return
	}

	var req BookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Kiểm tra nhà hàng tồn tại
	exists, err := models.RestaurantExists(restaurantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found"})
		return
	}

	// Kiểm tra bàn có thuộc nhà hàng không
	exists, err = models.TableExistsInRestaurant(req.TableID, restaurantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Table not found in this restaurant"})
		return
	}

	// Tạo đối tượng booking từ request
	booking := models.Booking{
		NumberOfCustomer: req.NumberOfCustomer,
		BookDate:         req.BookDate,
		TimeStart:        req.TimeStart,
		TimeEnd:          req.TimeEnd,
		ActualEnd:        req.ActualEnd,
		Price:            req.Price,
		CustomerEmail:    req.CustomerEmail,
		TableID:          req.TableID,
		CustomerID:       req.CustomerID,
		Status:           req.Status,
	}

	// Kiểm tra duplicate booking
	if err := booking.Check(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Tạo booking mới trong database
	bookingID, err := booking.Create()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	booking.ID = int(bookingID)
	c.JSON(http.StatusCreated, gin.H{"message": "Booking created successfully", "booking": booking})
}

// GetBookingsByCustomerID lấy danh sách booking của một khách hàng
func GetBookingsByCustomerID(c *gin.Context) {
	customerID, err := strconv.Atoi(c.Param("customer_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	bookings, err := models.GetBookingsByCustomer(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"customer_id": customerID, "bookings": bookings})
}
