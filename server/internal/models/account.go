package models

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/restaurent_table_booking/internal/db"
	"github.com/restaurent_table_booking/internal/utils"
)

type Account struct {
	Id        int64
	Name      string
	Email     string
	Phone     string
	Password  string
	Role      string
	Status    string
	Orther_id int64
}

func (u *Account) RegisterCustomer() error {
	_, check := CheckAccount(u)
	if !check {
		return errors.New("This gmail already create account before!!")
	}
	query := `INSERT INTO customers(name, gmail, phone, password, status) 
		VALUES (?,?,?,?,?)`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		panic(err)
		return err
	}
	defer stmt.Close()
	hashPassword, err := utils.HashPassword(u.Password)
	if err != nil {
		panic(err)
		return err
	}
	u.Status = "active"
	result, err := stmt.Exec(u.Name, u.Email, u.Phone, hashPassword, u.Status)
	if err != nil {
		panic(err)
		return err
	}
	id, err := result.LastInsertId()
	u.Id = id
	return nil
}

func (u *Account) RegisterOwner() error {
	_, check := CheckAccount(u)
	if !check {
		return errors.New("This gmail already create account before!!")
	}
	query := `INSERT INTO owners(name, gmail, phone, password, status) 
		VALUES (?,?,?,?,?)`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		panic(err)
		return err
	}
	defer stmt.Close()
	hashPassword, err := utils.HashPassword(u.Password)
	if err != nil {
		panic(err)
		return err
	}
	u.Status = "active"
	result, err := stmt.Exec(u.Name, u.Email, u.Phone, hashPassword, u.Status)
	if err != nil {
		panic(err)
		return err
	}
	id, err := result.LastInsertId()
	u.Id = id
	return nil
}

func (u *Account) RegisterAdmin() error {
	_, check := CheckAccount(u)
	if !check {
		return errors.New("This gmail already create account before!!")
	}
	query := `INSERT INTO admin(name, gmail, phone, password) 
		VALUES (?,?,?,?)`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		panic(err)
		return err
	}
	defer stmt.Close()
	hashPassword, err := utils.HashPassword(u.Password)
	if err != nil {
		panic(err)
		return err
	}
	result, err := stmt.Exec(u.Name, u.Email, u.Phone, hashPassword)
	if err != nil {
		panic(err)
		return err
	}
	id, err := result.LastInsertId()
	u.Id = id
	return nil
}

func (u *Account) RegisterStaff() error {
	_, check := CheckAccount(u)
	if !check {
		return errors.New("This gmail already create account before!!")
	}
	query := `INSERT INTO staffs(name, gmail, phone, password, status, restaurant_id) 
		VALUES (?,?,?,?,?,?)`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		panic(err)
		return err
	}
	defer stmt.Close()
	hashPassword, err := utils.HashPassword(u.Password)
	if err != nil {
		panic(err)
		return err
	}
	u.Status = "active"
	result, err := stmt.Exec(u.Name, u.Email, u.Phone, hashPassword, u.Status, u.Orther_id)
	if err != nil {
		panic(err)
		return err
	}
	id, err := result.LastInsertId()
	u.Id = id
	return nil
}

func (u *Account) Login() error {
	retrievedPassword, ok := CheckAccount(u)
	if ok {
		return errors.New("Email does not exist")
	}

	if u.Status == "inactive" {
		return errors.New("This account is locked for security. Check your email and contact us.")
	} else if u.Status == "ban" && u.Role == "staff" {
		return errors.New("Account deleted. Contact the restaurant owner to restore.")
	} else if u.Status == "ban" && u.Role == "owner" || u.Status == "ban" && u.Role == "customer" {
		return errors.New("This account is locked for violation. Check your email and contact us.")
	}
	ok = utils.PasswordVerify(u.Password, retrievedPassword)
	if !ok {
		return errors.New("Invalid Password!")
	}
	return nil
}

func CheckAccount(a *Account) (string, bool) {
	CumtomersQuery := `
	SELECT id, password, status FROM customers
	WHERE gmail = ?
	`
	rowCustomer := db.DB.QueryRow(CumtomersQuery, a.Email)

	staffsQuery := `
	SELECT id, password, status FROM staffs
	WHERE gmail = ?
	`
	rowStaff := db.DB.QueryRow(staffsQuery, a.Email)

	adminsQuery := `
	SELECT id, password FROM admin
	WHERE gmail = ?
	`
	rowAdmin := db.DB.QueryRow(adminsQuery, a.Email)

	ownersQuery := `
	SELECT id, password, status FROM owners
	WHERE gmail = ?
	`
	rowOwner := db.DB.QueryRow(ownersQuery, a.Email)

	var retrievedPassword string
	var err error
	err = rowAdmin.Scan(&a.Id, &retrievedPassword)
	if err == nil {
		a.Role = "admin"
		return retrievedPassword, false
	} else {
		err = rowStaff.Scan(&a.Id, &retrievedPassword, &a.Status)
		if err == nil {
			a.Role = "staff"
			return retrievedPassword, false
		} else {
			err = rowOwner.Scan(&a.Id, &retrievedPassword, &a.Status)
			if err == nil {
				a.Role = "owner"
				return retrievedPassword, false
			} else {
				err = rowCustomer.Scan(&a.Id, &retrievedPassword, &a.Status)
				if err == nil {
					a.Role = "customer"
					return retrievedPassword, false
				} else {
					fmt.Printf("Don't have any account like this")
					return "", true
				}
			}
		}
	}
	return "", false
}

func (u *Account) ResetPassword() error {
	query := `UPDATE customers SET password = ? WHERE gmail = ?`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		panic(err)
	}
	defer stmt.Close()
	hashPassword, err := utils.HashPassword(u.Password)
	if err != nil {
		panic(err)
	}
	_, err = stmt.Exec(hashPassword, u.Email)
	if err != nil {
		panic(err)
	}
	return nil
}

func GetAllAccounts() ([]Account, error) {
	sqlQuery := `
	SELECT * FROM users
	UNION
	SELECT * FROM admin`
	rows, err := db.DB.Query(sqlQuery)
	if err != nil {
		return nil, err
	}

	var users []Account

	defer rows.Close()

	for rows.Next() {
		var u Account
		err := rows.Scan(&u.Id, &u.Email, &u.Name, &u.Phone, &u.Password)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

func GetUserInformationById(userId int64, role string) (Account, error) {
	var query string
	var user Account // Định nghĩa struct chứa dữ liệu user

	// Xác định bảng cần query dựa trên role
	switch role {
	case "customer":
		query = `SELECT id, name, gmail, phone FROM customers WHERE id = ?`
	case "staff":
		query = `SELECT id, name, gmail, phone FROM staffs WHERE id = ?`
	case "admin":
		query = `SELECT id, name, gmail, phone FROM admin WHERE id = ?`
	case "owner":
		query = `SELECT id, name, gmail, phone FROM owners WHERE id = ?`
	default:
		return user, errors.New("invalid role")
	}

	// Thực hiện query
	row := db.DB.QueryRow(query, userId)
	err := row.Scan(&user.Id, &user.Name, &user.Email, &user.Phone)
	if err != nil {
		return user, errors.New(err.Error())
	}
	if err == sql.ErrNoRows {
		return user, errors.New(err.Error())
	}

	user.Role = role

	return user, nil
}

func SetAccountStatusInactive(email, role string) error {
	var query string
	switch role {
	case "customer":
		query = `UPDATE customers SET status = 'inactive' WHERE gmail = ?`
	case "staff":
		query = `UPDATE staffs SET status = 'inactive' WHERE gmail = ?`
	case "owner":
		query = `UPDATE owners SET status = 'inactive' WHERE gmail = ?`
	}

	stmt, err := db.DB.Prepare(query)
	if err != nil {
		panic(err)
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(email)
	return err
}
