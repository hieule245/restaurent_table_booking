package models

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

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
	StaffID          int     `json:"staff_id"`
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

func (b *Booking) CreateByStaff() (int64, error) {
	query := `
		INSERT INTO reservations (
			numberOfCustomer, book_date, time_start, time_end, actual_end, price, customer_email, table_id, staff_id, status
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
		b.StaffID,
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
func GetBookingsByUser(userGmail string) ([]Booking, error) {
	acc := &Account{} // Khởi tạo Account mới và lấy địa chỉ
	acc.Email = userGmail
	CheckAccount(acc)
	var query string
	if acc.Role == "customer" {
		query = `
		SELECT 
			id, numberOfCustomer, book_date, time_start, time_end, actual_end, price, customer_email, table_id, status 
		FROM reservations 
		WHERE customer_id = ?
	`
	} else if acc.Role == "staff" {
		query = `SELECT 
			id, numberOfCustomer, book_date, time_start, time_end, actual_end, price, customer_email, table_id, status 
		FROM reservations 
		WHERE staff_id = ?`
	}

	rows, err := db.DB.Query(query, acc.Id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bookings []Booking
	for rows.Next() {
		var b Booking
		if err := rows.Scan(&b.ID, &b.NumberOfCustomer, &b.BookDate, &b.TimeStart, &b.TimeEnd, &b.ActualEnd, &b.Price, &b.CustomerEmail, &b.TableID, &b.Status); err != nil {
			return nil, err
		}
		bookings = append(bookings, b)
	}
	if err = rows.Err(); err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	return bookings, nil
}

type Reservations struct {
	Id           int64
	CustomerName string
	BookingDate  time.Time
	BookingTime  string
	ActualTime   string
	TableName    string
	Price        float64
	Status       int
}

func GetBookingByOwner(ownerId int64) ([]Reservations, error) {
	var reservation []Reservations
	query := `
	SELECT
	b.id,
    t.name,
    c.name,
    b.book_date,
    SEC_TO_TIME(ABS(TIME_TO_SEC(TIMEDIFF(b.time_end, b.time_start)))),
    SEC_TO_TIME(ABS(TIME_TO_SEC(TIMEDIFF(b.actual_end, b.time_start)))),
    b.price,
	b.status
	FROM reservations b
	JOIN tables t ON b.table_id = t.id
	JOIN restaurants r ON t.restaurant_id = r.id
	JOIN owners o ON r.owner_id = o.id
	JOIN customers c On c.gmail = b.customer_email
	WHERE o.id = ?;
	`

	rows, err := db.DB.Query(query, ownerId)
	if err != nil {
		panic(err)
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var book Reservations
		err = rows.Scan(&book.Id, &book.TableName, &book.CustomerName, &book.BookingDate, &book.BookingTime, &book.ActualTime, &book.Price, &book.Status)
		if err != nil {
			panic(err)
			return nil, err
		}
		reservation = append(reservation, book)
	}
	return reservation, nil
}

// Owner or staff presses 'Finish' to free the table and record the bill.
func (res *Booking) Checkout() error {
	query := `
	UPDATE reservations SET price = ?, status = 4, actual_end = ?
	WHERE id = ?
	`
	fmt.Println(res.ActualEnd)
	_, err := db.DB.Exec(query, res.Price, res.ActualEnd, res.ID)
	if err != nil {
		return err
	}
	return nil
}

func (res *Booking) EditCheckout() error {
	query := `
	UPDATE reservations SET price = ?, 
	WHERE id = ?
	`
	_, err := db.DB.Exec(query, res.Price)
	if err != nil {
		return err
	}
	return nil
}
