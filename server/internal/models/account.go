package models

import (
	"database/sql"
	"errors"
	"fmt"
	"sync"

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
	ImageFile string
}

type NewPassword struct {
	OldPassword string
	NewPassword string
}

type CheckPassword struct {
	Attempt int
}

var failedAttempts = sync.Map{}

func (u *Account) RegisterCustomer() error {
	_, check := CheckAccount(u)
	if !check {
		return errors.New("Email already exists")
	}
	query := `INSERT INTO customers(name, gmail, phone, password, status) 
		VALUES (?,?,?,?,?)`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()
	hashPassword, err := utils.HashPassword(u.Password)
	if err != nil {
		return err
	}
	u.Status = "active"
	result, err := stmt.Exec(u.Name, u.Email, u.Phone, hashPassword, u.Status)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	u.Id = id
	return nil
}

func (u *Account) RegisterOwner() error {
	_, check := CheckAccount(u)
	if !check {
		return errors.New("Email already exists")
	}
	query := `INSERT INTO owners(name, gmail, phone, password, status) 
		VALUES (?,?,?,?,?)`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()
	hashPassword, err := utils.HashPassword(u.Password)
	if err != nil {
		return err
	}
	u.Status = "active"
	result, err := stmt.Exec(u.Name, u.Email, u.Phone, hashPassword, u.Status)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err

	}
	u.Id = id
	return nil
}

func (u *Account) RegisterAdmin() error {
	_, check := CheckAccount(u)
	if !check {
		return errors.New("Email already exists")
	}
	query := `INSERT INTO admin(name, gmail, phone, password) 
		VALUES (?,?,?,?)`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return errors.New("failed to prepare the SQL statement for registering admin: " + err.Error())
	}
	defer stmt.Close()

	hashPassword, err := utils.HashPassword(u.Password)
	if err != nil {
		return errors.New("failed to hash the password: " + err.Error())
	}
	result, err := stmt.Exec(u.Name, u.Email, u.Phone, hashPassword)
	if err != nil {
		return errors.New("failed to execute the SQL statement for registering admin: " + err.Error())
	}

	id, err := result.LastInsertId()
	if err != nil {
		return errors.New("failed to retrieve the last inserted ID for the new admin account: " + err.Error())
	}

	u.Id = id
	return nil
}

func (u *Account) Login() error {
	// Check if the user exists
	retrievedPassword, ok := CheckAccount(u)
	if ok {
		return errors.New("email does not exist")
	}

	if u.Status == "inactive" {
		return errors.New("this account is locked for security. Check your email and contact us")
	} else if u.Status == "ban" && u.Role == "staff" {
		return errors.New("account deleted. Contact the restaurant owner to restore")
	} else if u.Status == "ban" && u.Role == "owner" || u.Status == "ban" && u.Role == "customer" {
		return errors.New("this account is locked for violation. Check your email and contact us")
	}
	loginData, exists := failedAttempts.Load(u.Email)
	if exists {
		data := loginData.(CheckPassword)
		if data.Attempt == 5 {
			data.Attempt = 0
			failedAttempts.Delete(u.Email)
			return errors.New("This account is locked due to too many failed attempts. Check your email and contact us")
		}
	}

	ok = utils.PasswordVerify(u.Password, retrievedPassword)
	if !ok {
		check := CheckPassword{
			Attempt: 1,
		}

		if exists {
			check = loginData.(CheckPassword)
			check.Attempt++
		}

		failedAttempts.Store(u.Email, check)

		remainingAttempts := 5 - check.Attempt
		if check.Attempt == 5 {
			err := SetAccountStatusInactive(u.Email, u.Role)
			check.Attempt = 0
			failedAttempts.Delete(u.Email)
			if err != nil {
				return errors.New("Failed to set account status to inactive: " + err.Error())
			}
			return errors.New("This account is locked for security. Check your email and contact us")
		}
		return errors.New("invalid Password. You have " + fmt.Sprint(remainingAttempts) + " attempts left")
	}
	failedAttempts.Delete(u.Email)

	return nil
}

func CheckAccount(a *Account) (string, bool) {
	fmt.Println("CheckAccount 0-", a.Email)

	// Queries for each role
	queries := map[string]string{
		"admin":    "SELECT id, password FROM admin WHERE gmail = ?",
		"staff":    "SELECT id, password, status FROM staffs WHERE gmail = ?",
		"owner":    "SELECT id, password, status FROM owners WHERE gmail = ?",
		"customer": "SELECT id, password, status FROM customers WHERE gmail = ?",
	}

	// Iterate over roles and check each one
	for role, query := range queries {
		var retrievedPassword string
		var err error
		var row *sql.Row
		// Perform the query based on role
		row = db.DB.QueryRow(query, a.Email)

		// Scan the result based on the role
		switch role {
		case "admin":
			err = row.Scan(&a.Id, &retrievedPassword)
		case "staff":
			err = row.Scan(&a.Id, &retrievedPassword, &a.Status)
		case "owner":
			err = row.Scan(&a.Id, &retrievedPassword, &a.Status)
		case "customer":
			err = row.Scan(&a.Id, &retrievedPassword, &a.Status)
		}

		// Check if the account exists for the current role
		if err == nil {
			a.Role = role // Set the role for the user
			return retrievedPassword, false
		}
	}
	return "", true
}

func (u *Account) ResetPassword() error {
	fmt.Println("ResetPassword", u.Email, u.Password)
	CheckAccount(u)
	var query string
	switch u.Role {
	case "customer":
		query = `UPDATE customers SET password = ? WHERE gmail = ?`
	case "staff":
		query = `UPDATE staffs SET password = ? WHERE gmail = ?`
	case "admin":
		query = `UPDATE admin SET password = ? WHERE gmail = ?`
	case "owner":
		query = `UPDATE owners SET password = ? WHERE gmail = ?`
	default:
		return errors.New("invalid role provided")
	}
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return errors.New("failed to prepare the SQL statement for resetting password: " + err.Error())
	}
	defer stmt.Close()
	fmt.Println("ResetPassword", u.Email, u.Password)
	hashPassword, err := utils.HashPassword(u.Password)
	if err != nil {
		return errors.New("failed to hash the password: " + err.Error())
	}
	fmt.Println(hashPassword)
	_, err = stmt.Exec(hashPassword, u.Email)
	if err != nil {
		return errors.New("failed to execute the SQL statement for resetting password: " + err.Error())
	}
	return nil
}

func GetAllAccounts() ([]Account, error) {
	sqlQuery := `
	SELECT id, gmail, name, phone, status, 'owner' FROM owners
	UNION
	SELECT id, gmail, name, phone, status, 'customer' FROM customers
	UNION
	SELECT id, gmail, name, phone, status, 'staff' FROM staffs
	`
	rows, err := db.DB.Query(sqlQuery)
	if err != nil {
		return nil, errors.New("failed to execute the SQL query for retrieving all accounts: " + err.Error())
	}
	defer rows.Close()

	var users []Account
	for rows.Next() {
		var u Account
		err := rows.Scan(&u.Id, &u.Email, &u.Name, &u.Phone, &u.Status, &u.Role)
		if err != nil {
			return nil, errors.New("failed to scan account data: " + err.Error())
		}
		users = append(users, u)
	}

	if err = rows.Err(); err != nil {
		return nil, errors.New("error occurred during rows iteration: " + err.Error())
	}

	return users, nil
}

func GetUserInformationById(userId int64, role string) (Account, error) {
	var query string
	var user Account

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
		return user, errors.New("invalid role provided")
	}

	row := db.DB.QueryRow(query, userId)
	err := row.Scan(&user.Id, &user.Name, &user.Email, &user.Phone)
	if err != nil {
		if err == sql.ErrNoRows {
			return user, errors.New("user not found with the provided ID")
		}
		return user, errors.New("failed to retrieve user information: " + err.Error())
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
	default:
		return errors.New("invalid role provided for setting account status")
	}

	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return errors.New("failed to prepare the SQL statement for setting account status: " + err.Error())
	}
	defer stmt.Close()

	_, err = stmt.Exec(email)
	if err != nil {
		return errors.New("failed to execute the SQL statement for setting account status: " + err.Error())
	}
	return nil
}

// Update information

func (u *Account) UpdateCustomer() error {
	query := `UPDATE customers SET name = ?, phone = ?
    WHERE gmail = ?`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		panic(err)
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(u.Name, u.Phone, u.Email)
	if err != nil {
		panic(err)
		return err
	}
	return nil
}

func (u *Account) UpdateOwner() error {
	query := `UPDATE owners SET name = ?, phone = ?
    WHERE gmail = ?`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		panic(err)
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(u.Name, u.Phone, u.Email)
	if err != nil {
		panic(err)
		return err
	}
	return nil
}

func (u *Account) UpdateStaff() error {
	query := `UPDATE staffs SET name = ?, phone = ?
    WHERE gmail = ?`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return errors.New("failed to prepare the SQL statement for setting account status: " + err.Error())
	}
	defer stmt.Close()

	_, err = stmt.Exec(u.Name, u.Phone, u.Email)
	if err != nil {
		panic(err)
		return err
	}
	return err
}

func (u *Account) UpdateAdmin() error {
	query := `UPDATE admin SET name = ?, phone = ?
    WHERE gmail = ?`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return errors.New("failed to prepare the SQL statement for setting account status: " + err.Error())
	}
	defer stmt.Close()

	_, err = stmt.Exec(u.Name, u.Phone, u.Email)
	if err != nil {
		panic(err)
		return err
	}
	return err
}

func (acc *Account) ChangePassword(pass NewPassword) error {
	retrievedPassword, _ := CheckAccount(acc)
	ok := utils.PasswordVerify(pass.OldPassword, retrievedPassword)
	if !ok {
		return errors.New("Old password is not true!")
	}
	hashPassword, err := utils.HashPassword(pass.NewPassword)
	if err != nil {
		panic(err)
		return err
	}
	query := `
	UPDATE customers SET password = ?
	WHERE gmail = ?
	`

	stmt, err := db.DB.Prepare(query)
	if err != nil {
		panic(err)
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(hashPassword, acc.Email)
	if err != nil {
		panic(err)
		return err
	}
	return nil
}

func SaveImage(imageUrl string) (int64, error) {
	// Lưu ảnh dưới dạng BLOB
	query := `
	INSERT INTO images (url) VALUES (?)
	`

	stmt, err := db.DB.Prepare(query)
	if err != nil {
		fmt.Print("save image 1- ", err)
		return 0, nil
	}

	defer stmt.Close()

	result, err := stmt.Exec(imageUrl)
	if err != nil {
		fmt.Print("save image 2- ", err)
		return 0, nil
	}
	var imageId int64

	imageId, err = result.LastInsertId()
	if err != nil {
		fmt.Print("save image 3- ", err)
		return 0, nil
	}
	return imageId, nil
}

func SaveImageAvatar(imageId int64, acc *Account) error {
	var query string
	CheckAccount(acc)
	switch acc.Role {
	case "customer":
		query = `UPDATE customers SET image_id = ? WHERE id = ?`
	case "staff":
		query = `UPDATE staffs SET image_id = ? WHERE id = ?`
	case "owner":
		query = `UPDATE owners SET image_id = ? WHERE id = ?`
	default:
		return errors.New("invalid role provided")
	}

	stmt, err := db.DB.Prepare(query)
	if err != nil {
		fmt.Print("save image 4- ", err)
		return nil
	}
	defer stmt.Close()
	_, err = stmt.Exec(imageId, acc.Id)
	return err
}

func (acc *Account) GetAvatar() error {
	var query string
	switch acc.Role {
	case "customer":
		query = `SELECT url FROM customers c LEFT JOIN images i ON c.image_id = i.id WHERE c.id = ?`
	case "staff":
		query = `SELECT url FROM staffs s LEFT JOIN images i ON s.image_id = i.id WHERE s.id = ?`
	case "owner":
		query = `SELECT url FROM owners o LEFT JOIN images i ON o.image_id = i.id WHERE o.id = ?`
	default:
		return errors.New("invalid role provided")
	}

	row := db.DB.QueryRow(query, acc.Id)

	err := row.Scan(&acc.ImageFile)
	if err != nil {
		fmt.Println("get avatar 1- ", err)
		return err
	}
	return nil
}
