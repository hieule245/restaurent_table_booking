package db

import (
	"database/sql"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() {
	var err error = nil
	DB, err = sql.Open("mysql", "root:123@tcp(localhost:3306)/restaurant_bookings")
	if err != nil {
		panic("Cannot connect to database")
	}
	DB.SetMaxOpenConns(10)
	DB.SetMaxIdleConns(5)

	createTable()
}

func createTable() {
	CustomerQuery := `
	CREATE TABLE IF NOT EXISTS customers (
		id INTEGER PRIMARY KEY AUTO_INCREMENT,
		gmail VARCHAR(50) NOT NULL UNIQUE,
		name NVARCHAR(50) NOT NULL, 
		phone VARCHAR(50) NOT NULL,
		password VARCHAR(250) NOT NULL
	)	
	`
	_, err := DB.Exec(CustomerQuery)
	if err != nil {
		panic(err)
	}

	AdminQuery := `
	CREATE TABLE IF NOT EXISTS admin (
		id INTEGER PRIMARY KEY AUTO_INCREMENT,
		gmail VARCHAR(50) NOT NULL UNIQUE,
		name NVARCHAR(50) NOT NULL, 
		phone VARCHAR(50) NOT NULL,
		password VARCHAR(250) NOT NULL
	)	
	`
	_, err = DB.Exec(AdminQuery)
	if err != nil {
		panic(err)
	}

	OwnerQuery := `
	CREATE TABLE IF NOT EXISTS owners (
		id INTEGER PRIMARY KEY AUTO_INCREMENT,
		gmail VARCHAR(50) NOT NULL UNIQUE,
		name NVARCHAR(50) NOT NULL, 
		phone VARCHAR(50) NOT NULL,
		password VARCHAR(250) NOT NULL
	)	
	`
	_, err = DB.Exec(OwnerQuery)
	if err != nil {
		panic(err)
	}

	RestaurantQuery := `
	CREATE TABLE IF NOT EXISTS restaurants (
		id INTEGER PRIMARY KEY AUTO_INCREMENT,
		name NVARCHAR(50) NOT NULL, 
		description VARCHAR(250) NOT NULL,
		time_start TIME NOT NULL,
		time_end TIME NOT NULL,
		location NVARCHAR(250) NOT NULL,
		owner_id INTEGER NOT NULL,
		FOREIGN KEY (owner_id) REFERENCES owners(id)
	)	
	`
	_, err = DB.Exec(RestaurantQuery)
	if err != nil {
		panic(err)
	}

	StaffQuery := `
	CREATE TABLE IF NOT EXISTS staffs (
		id INTEGER PRIMARY KEY AUTO_INCREMENT,
		gmail VARCHAR(50) NOT NULL UNIQUE,
		name NVARCHAR(50) NOT NULL, 
		phone VARCHAR(50) NOT NULL,
		password VARCHAR(250) NOT NULL,
		restaurant_id INTEGER NOT NULL,
		FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
	)`
	_, err = DB.Exec(StaffQuery)
	if err != nil {
		panic(err)
	}

	TableQuery := `
	CREATE TABLE IF NOT EXISTS tables (
		id INTEGER PRIMARY KEY AUTO_INCREMENT,
		name NVARCHAR(50) NOT NULL, 
		type INTEGER NOT NULL,
		seats NVARCHAR(50) NOT NULL,
		restaurant_id INTEGER NOT NULL,
		FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
	)	
	`
	_, err = DB.Exec(TableQuery)
	if err != nil {
		panic(err)
	}

	StatusQuery := `
	CREATE TABLE IF NOT EXISTS status (
		id INTEGER PRIMARY KEY AUTO_INCREMENT,
		name NVARCHAR(50) NOT NULL
	)	
	`
	_, err = DB.Exec(StatusQuery)
	if err != nil {
		panic(err)
	}

	ReservationQuery := `
	CREATE TABLE IF NOT EXISTS reservations (
		id INTEGER PRIMARY KEY AUTO_INCREMENT,
		numberOfCustomer VARCHAR(50) NOT NULL,
		book_date DATE NOT NULL, 
		time_start TIME NOT NULL,
		time_end TIME NOT NULL,
		actual_end TIME NOT NULL,
		price FLOAT NOT NULL,
		customer_email VARCHAR(50) NOT NULL,
		table_id INTEGER NOT NULL,
		FOREIGN KEY (table_id) REFERENCES tables(id),
		customer_id INTEGER NOT NULL,
		FOREIGN KEY (customer_id) REFERENCES customers(id),
		status_id INTEGER NOT NULL,
		FOREIGN KEY (status_id) REFERENCES status(id)
	)	
	`
	_, err = DB.Exec(ReservationQuery)
	if err != nil {
		panic(err)
	}
}
