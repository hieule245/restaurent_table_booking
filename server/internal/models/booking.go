package models

import (
	"database/sql"
	"errors"

	"github.com/restaurent_table_booking/internal/db"
)

// Booking đại diện cho đơn đặt bàn (reservations)
type Booking struct {
	ID               int     `json:"id"`
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

// Create chèn một booking mới vào bảng reservations
func (b *Booking) Create() (int64, error) {
	query := `
		INSERT INTO reservations (
			numberOfCustomer, book_date, time_start, time_end, actual_end, price, customer_email, table_id, customer_id, status
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

// Check kiểm tra status and duplicate booking: cùng bàn, ngày và thời gian
func (b Booking) Check() error {
	var count int
	query := `
		SELECT COUNT(*) FROM reservations 
		WHERE table_id = ? AND book_date = ? AND time_start = ? AND time_end = ?
	`
	err := db.DB.QueryRow(query, b.TableID, b.BookDate, b.TimeStart, b.TimeEnd).Scan(&count)
	if err != nil {
		return err
	}

	// Nếu count > 0, kiểm tra xem có bản ghi nào có status = 0 hay không
	if count > 0 {
		var status int
		queryStatus := `
			SELECT status FROM reservations 
			WHERE table_id = ? AND book_date = ? AND time_start = ? AND time_end = ?
			LIMIT 1
		`
		err = db.DB.QueryRow(queryStatus, b.TableID, b.BookDate, b.TimeStart, b.TimeEnd).Scan(&status)
		if err != nil {
			return err
		}
		// Nếu status = 0, cho phép đặt bàn
		if status == 0 {
			return nil
		}
		return errors.New("booking already exists for this table, date, and time")
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

// GetBookingsByCustomer lấy danh sách booking của một customer dưới dạng []Booking
func GetBookingsByCustomer(customerID int) ([]Booking, error) {
	query := `
		SELECT 
			id, numberOfCustomer, book_date, time_start, time_end, actual_end, price, customer_email, table_id, customer_id, status 
		FROM reservations 
		WHERE customer_id = ?
	`
	rows, err := db.DB.Query(query, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookings []Booking
	for rows.Next() {
		var b Booking
		if err := rows.Scan(&b.ID, &b.NumberOfCustomer, &b.BookDate, &b.TimeStart, &b.TimeEnd, &b.ActualEnd, &b.Price, &b.CustomerEmail, &b.TableID, &b.CustomerID, &b.Status); err != nil {
			return nil, err
		}
		bookings = append(bookings, b)
	}
	if err = rows.Err(); err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	return bookings, nil
}
