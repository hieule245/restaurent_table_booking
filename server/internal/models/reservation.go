package models

import (
	"fmt"

	"github.com/restaurent_table_booking/internal/db"
)

// Reservation đại diện cho một lần đặt bàn
type Reservation struct {
	ID               int    `json:"id"`
	NumberOfCustomer int    `json:"number_of_customer"`
	CustomerEmail    string `json:"customer_email"`
	BookDate         string `json:"book_date"`  // YYYY-MM-DD
	TimeStart        string `json:"time_start"` // HH:MM:SS hoặc HH:MM
	TimeEnd          string `json:"time_end"`
	Status           string `json:"status"`
}

type ReservationDetail struct {
	ID               int     `json:"id"`
	NumberOfCustomer int     `json:"number_of_customer"`
	BookDate         string  `json:"book_date"`  // YYYY-MM-DD
	TimeStart        string  `json:"time_start"` // HH:MM:SS hoặc HH:MM
	TimeEnd          string  `json:"time_end"`
	ActualEnd        *string `json:"actual_end,omitempty"` // có thể null
	Price            float64 `json:"price"`
	TableID          int     `json:"table_id"`
	StaffID          *int    `json:"staff_id,omitempty"`
	CustomerID       *int    `json:"customer_id,omitempty"`
	Status           int     `json:"status"`
	// Thông tin khách hàng
	CustomerName  string  `json:"customer_name,omitempty"`
	CustomerPhone *string `json:"customer_phone,omitempty"`
	CustomerGmail string  `json:"customer_gmail,omitempty"`
	// Thông tin staff
	StaffName  *string `json:"staff_name,omitempty"`
	StaffGmail *string `json:"staff_gmail,omitempty"`
}

// GetReservationsByTableDate lấy tất cả các reservation của bàn (tableID) vào ngày bookDate
func GetReservationsByTableDate(tableID int, bookDate string) ([]Reservation, error) {
	query := `
		SELECT id, book_date, time_start, time_end, status
		FROM reservations
		WHERE table_id = ?
		  AND book_date = ?
		ORDER BY time_start
	`
	rows, err := db.DB.Query(query, tableID, bookDate)
	if err != nil {
		return nil, err
	}
	defer func() {
		if err := rows.Close(); err != nil {
			fmt.Println("Error closing rows:", err)
		}
	}()

	var reservations []Reservation
	for rows.Next() {
		var r Reservation
		if err := rows.Scan(&r.ID, &r.BookDate, &r.TimeStart, &r.TimeEnd, &r.Status); err != nil {
			return nil, err
		}
		reservations = append(reservations, r)
	}
	return reservations, nil
}
