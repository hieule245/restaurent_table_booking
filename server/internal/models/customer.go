package models

import (
	"errors"

	"github.com/restaurent_table_booking/internal/db"
)

// Booking đại diện cho đơn đặt bàn (reservations)
type Booking struct {
	ID               int     `json:"id"`
	NumberOfCustomer string  `json:"numberOfCustomer"` // Lưu số lượng khách dưới dạng chuỗi theo định nghĩa trong DB
	BookDate         string  `json:"book_date"`        // Có thể dùng string (YYYY-MM-DD) hoặc time.Time nếu muốn parse
	TimeStart        string  `json:"time_start"`       // Ví dụ "12:00:00"
	TimeEnd          string  `json:"time_end"`
	ActualEnd        string  `json:"actual_end"`
	Price            float64 `json:"price"`
	CustomerEmail    string  `json:"customer_email"`
	TableID          int     `json:"table_id"`
	CustomerID       int     `json:"customer_id"`
	Status           int     `json:"status"`
}

// Create chèn một booking mới vào bảng reservations
func (b *Booking) Create() (int64, error) {
	query := `
		INSERT INTO reservations (
			numberOfCustomer, 
			book_date, 
			time_start, 
			time_end, 
			actual_end, 
			price, 
			customer_email, 
			table_id, 
			customer_id, 
			status
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	result, err := db.DB.Exec(query,
		b.NumberOfCustomer,
		b.BookDate,
		b.TimeStart,
		b.TimeEnd,
		b.ActualEnd,
		b.Price,
		b.CustomerEmail,
		b.TableID,
		b.CustomerID,
		b.Status,
	)
	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}

func (booking Booking) Check() error {
	// Kiểm tra duplicate booking: nếu đã có booking cho cùng bàn, ngày và giờ bắt đầu/kết thúc
	var count int
	duplicateQuery := `
		SELECT COUNT(*) FROM reservations 
		WHERE table_id = ? AND book_date = ? AND time_start = ? AND time_end = ?
	`
	err := db.DB.QueryRow(duplicateQuery, booking.TableID, booking.BookDate, booking.TimeStart, booking.TimeEnd).Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("booking already existed for this table, date and time")
	}
	return nil
}

// RestaurantExists kiểm tra xem nhà hàng có tồn tại không
func RestaurantExists(restaurantID int) (bool, error) {
	var exists bool
	err := db.DB.QueryRow("SELECT EXISTS (SELECT 1 FROM restaurants WHERE id = ?)", restaurantID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

// TableExistsInRestaurant kiểm tra xem bàn có thuộc nhà hàng không
func TableExistsInRestaurant(tableID, restaurantID int) (bool, error) {
	var exists bool
	err := db.DB.QueryRow("SELECT EXISTS (SELECT 1 FROM tables WHERE id = ? AND restaurant_id = ?)", tableID, restaurantID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

// GetBookingsByCustomer lấy danh sách booking của một customer (ví dụ sử dụng JOIN để lấy thêm thông tin)
func GetBookingsByCustomer(customerID int) ([]map[string]interface{}, error) {
	rows, err := db.DB.Query(`
		SELECT 
		r.id,
		r.numberOfCustomer,
		r.book_date,
		r.time_start,
		r.time_end,
		r.actual_end,
		r.price,
		r.customer_email,
		r.status,
		t.name AS table_name
		FROM reservations r
		JOIN tables t ON r.table_id = t.id
		WHERE r.customer_id = ?`, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookings []map[string]interface{}
	for rows.Next() {
		var bookingID int
		var numberOfCustomer, bookDate, timeStart, timeEnd, actualEnd, tableName, status, customerEmail string
		var price float64

		if err := rows.Scan(&bookingID, &numberOfCustomer, &bookDate, &timeStart, &timeEnd, &actualEnd, &price, &customerEmail, &tableName, &status); err != nil {
			return nil, err
		}

		bookings = append(bookings, map[string]interface{}{
			"booking_id":       bookingID,
			"numberOfCustomer": numberOfCustomer,
			"book_date":        bookDate,
			"time_start":       timeStart,
			"time_end":         timeEnd,
			"actual_end":       actualEnd,
			"price":            price,
			"customer_email":   customerEmail,
			"table_name":       tableName,
			"status":           status,
		})
	}

	return bookings, nil
}
