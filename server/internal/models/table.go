package models

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/restaurent_table_booking/internal/db"
)

// 🏷️ Table Model
type Table struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Type         string `json:"type"`
	Seats        int    `json:"seats"`
	Status       string `json:"status"`
	RestaurantID int    `json:"restaurant_id"`
	Description  string
	ImageFile    string `json:"image_file"`
	ImageId      int    `json:"image_id"`
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
	defer func() {
		if err := rows.Close(); err != nil {
			fmt.Println("Error closing rows:", err)
		}
	}()

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
func GetAllTables(restaurantID int64) ([]Table, error) {
	rows, err := db.DB.Query("SELECT id, name, type, seats, description, restaurant_id, image_id FROM tables WHERE restaurant_id = ? AND status = 'active'", restaurantID)
	if err != nil {
		return nil, err
	}
	defer func() {
		if err := rows.Close(); err != nil {
			fmt.Println("Error closing rows:", err)
		}
	}()

	var tables []Table
	for rows.Next() {
		var table Table
		err := rows.Scan(&table.ID, &table.Name, &table.Type, &table.Seats, &table.Description, &table.RestaurantID, &table.ImageId)
		if err != nil {
			return nil, err
		}
		row := db.DB.QueryRow("SELECT url FROM images WHERE id = ?", table.ImageId)
		err = row.Scan(&table.ImageFile)
		if err != nil {
			return nil, err
		}
		tables = append(tables, table)
	}

	return tables, nil
}

// Lấy chi tiết một bàn ăn
func GetTableByID(tableID int) (*Table, error) {
	var table Table
	err := db.DB.QueryRow("SELECT id, name, type, seats, restaurant_id FROM tables WHERE id = ? AND status = 'active'", tableID).
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
		fmt.Println("table 1-", err)
		return err
	}
	if !exists {
		return errors.New("restaurant does not exist")
	}
	if err != nil {
		fmt.Println("table 2-", err)
		return err
	}
	if t.Seats <= 0 {
		return errors.New("this table should have seat")
	}

	query := `INSERT INTO tables (name, type, seats, status, restaurant_id, description, image_id) VALUES (?, ?, ?, ?, ?, ?, ?)`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		fmt.Println("table 3-", err)
		return err
	}
	defer func() {
		if err := stmt.Close(); err != nil {
			fmt.Println("Error closing:", err)
		}
	}()
	t.Status = "active"
	result, err := stmt.Exec(t.Name, t.Type, t.Seats, t.Status, t.RestaurantID, t.Description, t.ImageId)
	if err != nil {
		fmt.Println("table 4-", err)
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		fmt.Println("table 5-", err)
		return err
	}

	t.ID = int(id)
	return nil
}

// Cập nhật bàn ăn
func (t *Table) UpdateTable() error {
	fmt.Println("image 3-", t.ImageId)
	var err error
	var query string
	// Nếu không có ảnh mới, lấy lại image_id hiện tại từ DB
	if t.ImageId == 0 {
		query = `UPDATE tables SET name = ?, type = ?, seats = ? WHERE id = ?`
		_, err = db.DB.Exec(query, t.Name, t.Type, t.Seats, t.ID)
	} else {
		query = `UPDATE tables SET name = ?, type = ?, seats = ?, image_id = ? WHERE id = ?`
		_, err = db.DB.Exec(query, t.Name, t.Type, t.Seats, t.ImageId, t.ID)
	}

	if err != nil {
		return err
	}

	fmt.Println("image 4-", t.ImageId)
	return nil
}

// Xóa bàn ăn
func DeleteTable(tableID int) error {
	query := `UPDATE tables SET status = 'inactive' WHERE id = ?`
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
		  ) AND t.status = 'active'
	`
	rows, err := db.DB.Query(query, restaurantID, bookDate, desiredEnd, desiredStart)
	if err != nil {
		return nil, err
	}
	defer func() {
		if err := rows.Close(); err != nil {
			fmt.Println("Error closing file:", err)
		}
	}()

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
		return nil, errors.New("no available tables found")
	}

	return tables, nil
}
