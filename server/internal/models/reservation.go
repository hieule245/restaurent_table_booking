package models

import "github.com/restaurent_table_booking/internal/db"

// Reservation đại diện cho một lần đặt bàn
type Reservation struct {
	ID        int    `json:"id"`
	BookDate  string `json:"book_date"`  // YYYY-MM-DD
	TimeStart string `json:"time_start"` // HH:MM:SS hoặc HH:MM
	TimeEnd   string `json:"time_end"`
}

// GetReservationsByTableDate lấy tất cả các reservation của bàn (tableID) vào ngày bookDate
func GetReservationsByTableDate(tableID int, bookDate string) ([]Reservation, error) {
	query := `
		SELECT id, book_date, time_start, time_end
		FROM reservations
		WHERE table_id = ?
		  AND book_date = ?
		ORDER BY time_start
	`
	rows, err := db.DB.Query(query, tableID, bookDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reservations []Reservation
	for rows.Next() {
		var r Reservation
		if err := rows.Scan(&r.ID, &r.BookDate, &r.TimeStart, &r.TimeEnd); err != nil {
			return nil, err
		}
		reservations = append(reservations, r)
	}
	return reservations, nil
}
