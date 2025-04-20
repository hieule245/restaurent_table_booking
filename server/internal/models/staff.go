package models

import (
	"errors"
	"fmt"
	"strconv"

	"github.com/restaurent_table_booking/internal/db"
	"github.com/restaurent_table_booking/internal/utils"
	pkg "github.com/restaurent_table_booking/pkg/email"
)

type Staff struct {
	ID           int64  `json:"id"`
	Gmail        string `json:"gmail"`
	Name         string `json:"name"`
	Phone        string `json:"phone"`
	Status       string `json:"status"`
	Password     string `json:"password"`
	RestaurantID string `json:"restaurant_id"`
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

func BanStaff(gmail string, ownerId, id int64) error {
	// Khóa nhân viên
	acc := &Account{}
	acc.Email = gmail
	CheckAccount(acc)

	if acc.Role != "admin" {
		return errors.New("You do not have permission in here!")
	}
	query := `
	UPDATE staffs SET status = 'ban'
	WHERE id = ?
	`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		fmt.Println(err)
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
	restaurantID, err := strconv.ParseInt(staff.RestaurantID, 10, 64)
	if err != nil {
		return err
	}
	err = CheckPermissionsToAdd(userId, restaurantID, staff.ID)
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
		} else if err == nil && staff.RestaurantID != st.RestaurantID && st.Status == "inactive" {
			stmt, err := db.DB.Prepare(`UPDATE staffs SET name = ?, status = 'active', password = ?, restaurant_id = ?, phone = ? WHERE id = ?`)
			if err != nil {
				fmt.Println(err)
				return err
			}
			hashPassword, err := utils.HashPassword(staff.Password)
			if err != nil {
				return err
			}
			_, err = stmt.Exec(staff.Name, hashPassword, staff.RestaurantID, staff.Phone, st.ID)
			if err != nil {
				return err
			}
			err = pkg.SendMailStaff(staff.Gmail, staff.Name, staff.Password)
			if err != nil {
				return err
			}
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

	err = pkg.SendMailStaff(staff.Gmail, staff.Name, staff.Password)
	if err != nil {
		return err
	}

	insertedID, _ := result.LastInsertId()
	staff.ID = insertedID
	return nil
}

func (res *Restaurant) GetRestaurantByStaffID(staffID int64) error {
	query := `
	SELECT restaurant_id FROM staffs
	WHERE id = ?
	`
	var restaurantID int64
	row := db.DB.QueryRow(query, staffID)
	err := row.Scan(&restaurantID)
	if err != nil {
		return err
	}

	query = `
	SELECT name, description, time_start, time_end, location FROM restaurants
	WHERE id = ?
	`
	row = db.DB.QueryRow(query, restaurantID)
	err = row.Scan(&res.Name, &res.Description, &res.Started, &res.Ended, &res.Location)
	if err != nil {
		return err
	}
	res.Id = restaurantID
	return nil
}

func GetTablesByRestaurantID(restaurantId int) ([]Table, error) {
	var tab []Table
	query := `
	SELECT id, name, type, seats, description FROM tables
	WHERE restaurant_id = ?
	`
	rows, err := db.DB.Query(query, restaurantId)
	if err != nil {
		fmt.Println("table 1: ", err)
		return nil, err
	}

	for rows.Next() {
		var table Table
		err := rows.Scan(&table.ID, &table.Name, &table.Type, &table.Seats, &table.Description)
		if err != nil {
			fmt.Println("table 2: ", err)
			return nil, err
		}
		table.RestaurantID = restaurantId
		tab = append(tab, table)
	}
	return tab, nil
}

func GetReservationByRestaurantID(resId int64) ([]Reservations, error) {
	var res []Reservations
	query := `
	SELECT
    b.id AS reservation_id,
    t.name AS table_name,
    CASE 
        WHEN b.customer_id IS NOT NULL THEN c.name
        ELSE s.name
    END AS user_name,
    CASE 
        WHEN b.customer_id IS NOT NULL THEN 'customer'
        ELSE 'staff'
    END AS user_type,
    b.book_date,
    SEC_TO_TIME(ABS(TIME_TO_SEC(TIMEDIFF(b.time_end, b.time_start)))) AS expected_duration,
    SEC_TO_TIME(ABS(TIME_TO_SEC(TIMEDIFF(b.actual_end, b.time_start)))) AS actual_duration,
    b.price,
    b.status
	FROM reservations b
	JOIN tables t ON b.table_id = t.id
	JOIN restaurants r ON t.restaurant_id = r.id
	JOIN owners o ON r.owner_id = o.id
	LEFT JOIN customers c ON b.customer_id = c.id
	LEFT JOIN staffs s ON b.staff_id = s.id
	WHERE r.id = ?;
	`

	rows, err := db.DB.Query(query, resId)
	if err != nil {
		fmt.Println("bok 1- ", err)
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var book Reservations
		err = rows.Scan(&book.Id, &book.TableName, &book.UserBook, &book.RoleBook, &book.BookingDate, &book.BookingTime, &book.ActualTime, &book.Price, &book.Status)
		if err != nil {
			fmt.Println("bok 2- ", err)
			return nil, err
		}
		res = append(res, book)
	}
	return res, nil
}

func SetStatusByAdmin(email, query string) error {
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		fmt.Println("prepare: ", err)
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(email)
	return nil
}

func BanByAdmin(email, role string) error {
	var query string
	switch role {
	case "owner":
		query = `
		UPDATE owners SET status = 'ban'
		WHERE gmail = ?
		`
	case "staff":
		query = `
		UPDATE staffs SET status = 'ban'
		WHERE gmail = ?
		`
	case "customer":
		query = `
		UPDATE customers SET status = 'ban'
		WHERE gmail = ?
		`
	default:
		return errors.New("Invalid role")
	}
	err := SetStatusByAdmin(email, query)
	if err != nil {
		fmt.Println("ban 1-: ", err)
	}
	return err
}

func UnbanByAdmin(email, role string) error {
	var query string
	switch role {
	case "owner":
		query = `
		UPDATE owners SET status = 'active'
		WHERE gmail = ?
		`
	case "staff":
		query = `
		UPDATE staffs SET status = 'active'
		WHERE gmail = ?
		`
	case "customer":
		query = `
		UPDATE customers SET status = 'active'
		WHERE gmail = ?
		`
	default:
		return errors.New("Invalid role")
	}
	err := SetStatusByAdmin(email, query)
	if err != nil {
		fmt.Println("ban 2-: ", err)
	}
	return err
}
