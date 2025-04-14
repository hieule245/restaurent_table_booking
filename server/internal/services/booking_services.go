package services

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/db"
	"github.com/restaurent_table_booking/internal/models"
	pkg "github.com/restaurent_table_booking/pkg/email"
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
	StaffID          int     `json:"staff_id"`
	Status           int     `json:"status"`
}

// CreateBooking xử lý tạo booking trực tiếp từ request
func CreateBooking(c *gin.Context) {
	restaurantID, err := strconv.Atoi(c.Param("restaurant_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid restaurant ID"})
		fmt.Println("1-", err)
		return
	}

	var req BookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		fmt.Println("2-", err)
		return
	}

	// Kiểm tra nhà hàng tồn tại
	exists, err := models.RestaurantExists(restaurantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println("3-", err)
		return
	}
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found"})
		fmt.Println("4-", err)
		return
	}

	// Kiểm tra bàn có thuộc nhà hàng không
	exists, err = models.TableExistsInRestaurant(req.TableID, restaurantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println("5-", err)
		return
	}
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Table not found in this restaurant"})
		fmt.Println("6-", err)
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
		fmt.Println("7-", err)
		return
	}

	// Tạo booking mới trong database
	bookingID, err := booking.Create()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println("8-", err)
		return
	}

	booking.ID = int(bookingID)

	// Sau khi booking được lưu thành công...
	bookingDetails := fmt.Sprintf(`
	<p><strong>Date:</strong> %s</p>
	<p><strong>Start Time:</strong> %s</p>
	<p><strong>End Time:</strong> %s</p>
	<p><strong>Number of Seats:</strong> %s</p>
`, booking.BookDate, booking.TimeStart, booking.TimeEnd, booking.NumberOfCustomer)

	// lay customer email
	user, err := models.GetUserInformationById(int64(booking.CustomerID), "customer")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println("9 u-", err)
		return
	}
	// Gửi email xác nhận booking cho người dùng
	pkg.SendBookingConfirmation(user.Email, bookingDetails)

	c.JSON(http.StatusCreated, gin.H{"message": "Booking created successfully", "booking": booking})
}

func CreateBookingByStaff(c *gin.Context) {
	restaurantID, err := strconv.Atoi(c.Param("restaurant_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid restaurant ID"})
		fmt.Println("1-", err)
		return
	}

	var req BookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		fmt.Println("2-", err)
		return
	}

	// Kiểm tra nhà hàng tồn tại
	exists, err := models.RestaurantExists(restaurantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println("3-", err)
		return
	}
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found"})
		fmt.Println("4-", err)
		return
	}

	// Kiểm tra bàn có thuộc nhà hàng không
	exists, err = models.TableExistsInRestaurant(req.TableID, restaurantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println("5-", err)
		return
	}
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Table not found in this restaurant"})
		fmt.Println("6-", err)
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
		StaffID:          req.StaffID,
		Status:           req.Status,
	}

	// Kiểm tra duplicate booking
	if err := booking.Check(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		fmt.Println("7-", err)
		return
	}

	// Tạo booking mới trong database
	bookingID, err := booking.CreateByStaff()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println("8-", err)
		return
	}

	booking.ID = int(bookingID)

	// Sau khi booking được lưu thành công...
	bookingDetails := fmt.Sprintf(`
	<p><strong>Date:</strong> %s</p>
	<p><strong>Start Time:</strong> %s</p>
	<p><strong>End Time:</strong> %s</p>
	<p><strong>Number of Seats:</strong> %s</p>
`, booking.BookDate, booking.TimeStart, booking.TimeEnd, booking.NumberOfCustomer)

	// lay customer email
	user, err := models.GetUserInformationById(int64(booking.StaffID), "staff")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		fmt.Println("9 s-", err)
		return
	}
	// Gửi email xác nhận booking cho người dùng
	pkg.SendBookingConfirmation(user.Email, bookingDetails)

	c.JSON(http.StatusCreated, gin.H{"message": "Booking created successfully", "booking": booking})
}

// GetBookingHistoryByUserID lấy danh sách booking của một khách hàng
func GetBookingHistoryByUserID(context *gin.Context) {
	userGmail := context.Query("user_gmail")
	if userGmail == "" {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Missing userId in query parameter"})
		return
	}

	bookings, err := models.GetBookingsByUser(userGmail)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"user_id": userGmail, "bookings": bookings})
}

// EditReservation - Chỉnh sửa đặt bàn
func EditReservation(c *gin.Context) {
	id := c.Param("reservation_id")

	// Parse input JSON từ client
	var input struct {
		NumberOfCustomer string `json:"numberOfCustomer"`
		BookDate         string `json:"book_date"`
		TimeStart        string `json:"time_start"`
		TimeEnd          string `json:"time_end"`
		Status           int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Lấy ngày đặt (book_date) và thời gian bắt đầu (time_start) gốc từ DB
	var bookDateStr, timeStartStr string
	err := db.DB.QueryRow(
		"SELECT DATE_FORMAT(book_date, '%Y-%m-%d'), TIME_FORMAT(time_start, '%H:%i:%s') FROM reservations WHERE id = ?",
		id,
	).Scan(&bookDateStr, &timeStartStr)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reservation not found"})
		return
	}

	// Kết hợp ngày và giờ ban đầu thành chuỗi datetime
	fullDateTimeStr := bookDateStr + " " + timeStartStr
	bookingDateTime, err := time.ParseInLocation("2006-01-02 15:04:05", fullDateTimeStr, time.Local)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid datetime format in reservation"})
		return
	}

	// Debug info
	fmt.Println("Booking DateTime:", bookingDateTime)
	fmt.Println("Current Time:", time.Now())
	duration := bookingDateTime.Sub(time.Now())
	fmt.Println("Time remaining until booking:", duration)

	// Nếu còn dưới 30 phút trước thời gian đặt bàn gốc, không cho chỉnh sửa
	if time.Now().Add(30 * time.Minute).After(bookingDateTime) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot edit less than 30 minutes before booking"})
		return
	}

	// Cập nhật thông tin đặt bàn mới
	_, err = db.DB.Exec(`
		UPDATE reservations 
		SET numberOfCustomer = ?, book_date = ?, time_start = ?, time_end = ?, status = ?
		WHERE id = ?
	`, input.NumberOfCustomer, input.BookDate, input.TimeStart, input.TimeEnd, input.Status, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update reservation"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reservation updated successfully"})
}

// CancelReservation - Hủy đặt bàn
// CancelReservation - Hủy đặt bàn
// CancelReservation - Hủy đặt bàn
func CancelReservation(c *gin.Context) {
	id := c.Param("reservation_id")

	// Lấy ngày đặt (book_date) và thời gian bắt đầu (time_start) dưới dạng chuỗi
	var bookDateStr, timeStartStr string
	err := db.DB.QueryRow(
		"SELECT DATE_FORMAT(book_date, '%Y-%m-%d'), TIME_FORMAT(time_start, '%H:%i:%s') FROM reservations WHERE id = ?",
		id,
	).Scan(&bookDateStr, &timeStartStr)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Kết hợp book_date và time_start thành chuỗi datetime
	fullDateTimeStr := bookDateStr + " " + timeStartStr
	// Parse datetime theo định dạng "2006-01-02 15:04:05" với múi giờ local
	bookingDateTime, err := time.ParseInLocation("2006-01-02 15:04:05", fullDateTimeStr, time.Local)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid datetime format"})
		return
	}

	fmt.Println("Booking DateTime:", bookingDateTime)
	fmt.Println("Current Time:", time.Now())
	duration := bookingDateTime.Sub(time.Now())
	fmt.Println("Time remaining until booking:", duration)

	// So sánh với thời gian hiện tại: nếu thời gian hiện tại sau thời gian đặt bàn thì không cho hủy
	if time.Now().After(bookingDateTime.Add(-1 * time.Hour)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot cancel within 1 hour before booking time"})
		return
	}

	_, err = db.DB.Exec("UPDATE reservations SET status = ? WHERE id = ?", 0, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reservation canceled successfully"})
}
