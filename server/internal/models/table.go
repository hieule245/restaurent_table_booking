package models

import (
	"database/sql"
	"errors"

	"github.com/restaurent_table_booking/internal/db"
)

// 🏷️ Table Model
type Table struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Type         string `json:"type"`
	Seats        int    `json:"seats"`
	RestaurantID int    `json:"restaurant_id"`
	Description  string
}

func SearchTables(name, tableType string, seats, restaurantID int) ([]Table, error) {
	var tables []Table
	query := "SELECT * FROM tables WHERE 1=1"

	var args []interface{}

	if name != "" {
		query += " AND name LIKE ?"
		args = append(args, "%"+name+"%")
	}
	if tableType != "" {
		query += " AND type = ?"
		args = append(args, tableType)
	}
	if seats > 0 {
		query += " AND seats >= ?"
		args = append(args, seats)
	}
	if restaurantID > 0 {
		query += " AND restaurant_id = ?"
		args = append(args, restaurantID)
	}

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var t Table
		if err := rows.Scan(&t.ID, &t.Name, &t.Type, &t.Seats, &t.Description, &t.RestaurantID); err != nil {
			return nil, err
		}
		tables = append(tables, t)
	}

	return tables, nil
}

// Kiểm tra nhà hàng có tồn tại không
func IsRestaurantExist(restaurantID int) (bool, error) {
	var count int
	err := db.DB.QueryRow("SELECT COUNT(*) FROM restaurants WHERE id = ?", restaurantID).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// Lấy tất cả bàn ăn theo restaurant_id
func GetAllTables(restaurantID int) ([]Table, error) {
	rows, err := db.DB.Query("SELECT id, name, type, seats, restaurant_id FROM tables WHERE restaurant_id = ?", restaurantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []Table
	for rows.Next() {
		var table Table
		if err := rows.Scan(&table.ID, &table.Name, &table.Type, &table.Seats, &table.RestaurantID); err != nil {
			return nil, err
		}
		tables = append(tables, table)
	}

	return tables, nil
}

// Lấy chi tiết một bàn ăn
func GetTableByID(tableID int) (*Table, error) {
	var table Table
	err := db.DB.QueryRow("SELECT id, name, type, seats, restaurant_id FROM tables WHERE id = ?", tableID).
		Scan(&table.ID, &table.Name, &table.Type, &table.Seats, &table.RestaurantID)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &table, nil
}

// Tạo bàn ăn mới
func (t *Table) CreateTable() error {
	// 🏷️ Kiểm tra nhà hàng có tồn tại không
	exists, err := IsRestaurantExist(t.RestaurantID)
	if err != nil {
		return err
	}
	if !exists {
		return errors.New("Restaurant does not exist")
	}

	query := `INSERT INTO tables (name, type, seats, restaurant_id, description) VALUES (?, ?, ?, ?, ?)`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	result, err := stmt.Exec(t.Name, t.Type, t.Seats, t.RestaurantID, t.Description)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	t.ID = int(id)
	return nil
}

// Cập nhật bàn ăn
func (t *Table) UpdateTable() error {
	query := `UPDATE tables SET name = ?, type = ?, seats = ? WHERE id = ?`
	_, err := db.DB.Exec(query, t.Name, t.Type, t.Seats, t.ID)
	return err
}

// Xóa bàn ăn
func DeleteTable(tableID int) error {
	query := `DELETE FROM tables WHERE id = ?`
	_, err := db.DB.Exec(query, tableID)
	return err
}

func SearchAvailableTables(restaurantID int, bookDate, desiredStart, desiredEnd string) ([]Table, error) {
	var tables []Table
	query := `
		SELECT t.id, t.name, t.type, t.seats, t.restaurant_id, t.description
		FROM tables t
		WHERE t.restaurant_id = ?
		  AND NOT EXISTS (
			SELECT 1 FROM reservations r
			WHERE r.table_id = t.id
			  AND r.book_date = ?
			  AND r.time_start < ?
			  AND r.time_end > ?
		  )
	`
	rows, err := db.DB.Query(query, restaurantID, bookDate, desiredEnd, desiredStart)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var t Table
		if err := rows.Scan(&t.ID, &t.Name, &t.Type, &t.Seats, &t.RestaurantID, &t.Description); err != nil {
			return nil, err
		}
		tables = append(tables, t)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	// Nếu không có bàn nào, có thể trả về lỗi tùy chọn hoặc danh sách rỗng
	if len(tables) == 0 {
		return nil, errors.New("No available tables found")
	}

	return tables, nil
}
