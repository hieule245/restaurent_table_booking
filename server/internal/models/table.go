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
}

// 📌 Kiểm tra nhà hàng có tồn tại không
func IsRestaurantExist(restaurantID int) (bool, error) {
	var count int
	err := db.DB.QueryRow("SELECT COUNT(*) FROM restaurants WHERE id = ?", restaurantID).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// 📌 Lấy tất cả bàn ăn theo restaurant_id
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

// 📌 Lấy chi tiết một bàn ăn
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

// 📌 Tạo bàn ăn mới
func (t *Table) CreateTable() error {
	// 🏷️ Kiểm tra nhà hàng có tồn tại không
	exists, err := IsRestaurantExist(t.RestaurantID)
	if err != nil {
		return err
	}
	if !exists {
		return errors.New("Restaurant does not exist")
	}

	query := `INSERT INTO tables (name, type, seats, restaurant_id) VALUES (?, ?, ?, ?)`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	result, err := stmt.Exec(t.Name, t.Type, t.Seats, t.RestaurantID)
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

// 📌 Cập nhật bàn ăn
func (t *Table) UpdateTable() error {
	query := `UPDATE tables SET name = ?, type = ?, seats = ? WHERE id = ?`
	_, err := db.DB.Exec(query, t.Name, t.Type, t.Seats, t.ID)
	return err
}

// 📌 Xóa bàn ăn
func DeleteTable(tableID int) error {
	query := `DELETE FROM tables WHERE id = ?`
	_, err := db.DB.Exec(query, tableID)
	return err
}
