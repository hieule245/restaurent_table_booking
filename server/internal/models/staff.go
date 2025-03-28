package models

import (
	"errors"
	"fmt"
	"strconv"

	"github.com/restaurent_table_booking/internal/db"
	"github.com/restaurent_table_booking/internal/utils"
)

type Staff struct {
	ID           int64  `json:"id"`
	Gmail        string `json:"gmail"`
	Name         string `json:"name"`
	Phone        string `json:"phone"`
	Status       string `json:"status"`
	Password     string `json:"password"`
	RestaurantID int64  `json:"restaurant_id"`
}

func GetAllStaffEachRestaurant(restaurantID int64) ([]Staff, error) {
	query := `
	SELECT id, name, gmail, phone, status FROM staffs
	WHERE restaurant_id = ?
	`
	rows, err := db.DB.Query(query, restaurantID)
	if err != nil {
		panic(err)
		return nil, err
	}
	defer rows.Close()

	var st []Staff
	for rows.Next() {
		var staff Staff
		err := rows.Scan(&staff.ID, &staff.Name, &staff.Gmail, &staff.Phone, &staff.Status)
		if err != nil {
			panic(err)
			return nil, err
		}
		st = append(st, staff)
	}
	return st, nil
}

func CheckPermissionsToLock(ownerId, id int64) error {
	var str string
	rows := db.DB.QueryRow("SELECT restaurant_id FROM staffs WHERE id = ?", id)
	err := rows.Scan(&str)
	if err != nil {
		panic(err)
		return err
	}

	restaurant_id, err := strconv.ParseInt(str, 10, 64)
	CheckPermissionsToAdd(ownerId, restaurant_id, id)
	return nil
}

func CheckPermissionsToAdd(ownerId, restaurant_id, id int64) error {
	rows := db.DB.QueryRow("SELECT owner_id FROM restaurants WHERE id = ?", restaurant_id)
	var ownerStr string
	rows.Scan(&ownerStr)
	owner_id, err := strconv.ParseInt(ownerStr, 10, 64)
	if err != nil {
		panic(err)
		return err
	}
	if ownerId != owner_id {
		return errors.New("You do not have permission in here!")
	}
	return nil
}

func LockStaff(ownerId, id int64) error {
	// Check quyền
	err := CheckPermissionsToLock(ownerId, id)

	// Khóa nhân viên
	query := `
	UPDATE staffs SET status = 'inactive'
	WHERE id = ?
	`
	if err != nil {
		panic(err)
		return err
	}

	stmt, err := db.DB.Prepare(query)
	if err != nil {
		panic(err)
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(id)
	return nil
}

func UnlockStaff(ownerId, id int64) error {
	// Check quyền
	err := CheckPermissionsToLock(ownerId, id)

	// Khóa nhân viên
	query := `
	UPDATE staffs SET status = 'active'
	WHERE id = ?
	`

	if err != nil {
		panic(err)
		return err
	}

	stmt, err := db.DB.Prepare(query)
	if err != nil {
		panic(err)
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(id)
	return nil
}

func (staff *Staff) CreateStaff(userId int64) error {
	query := `
	INSERT INTO staffs (gmail, name, phone, status, password, restaurant_id) 
	VALUES (?, ?, ?, ?, ?, ?);
	`
	err := CheckPermissionsToAdd(userId, staff.RestaurantID, staff.ID)
	if err != nil {
		return err
	}
	rows, err := db.DB.Query(`SELECT id, restaurant_id, status FROM staffs WHERE gmail = ?`, staff.Gmail)
	for rows.Next() {
		var st Staff
		err := rows.Scan(&st.ID, &st.RestaurantID, &st.Status)
		if err != nil {
			fmt.Println(err)
			return err
		}
		if err == nil && staff.RestaurantID == st.RestaurantID {
			return errors.New("This account has already been created here!")
		} else if err == nil && staff.RestaurantID != st.RestaurantID && st.Status == "active" {
			return errors.New("This staff has already work in another place!")
		} else if err == nil && st.Status == "ban" {
			return errors.New("This staff was blocked for working elsewhere!")
		}
	}

	stmt, err := db.DB.Prepare(query)
	if err != nil {
		fmt.Println(err)
		return err
	}
	defer stmt.Close()
	staff.Status = "active"

	hashPassword, err := utils.HashPassword(staff.Password)
	if err != nil {
		return err
	}

	result, err := stmt.Exec(staff.Gmail, staff.Name, staff.Phone, staff.Status, hashPassword, staff.RestaurantID)
	if err != nil {
		return err
	}

	insertedID, _ := result.LastInsertId()
	staff.ID = insertedID
	return nil
}
