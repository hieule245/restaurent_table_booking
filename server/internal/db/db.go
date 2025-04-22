package db

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB
var IsDBConnected = false

func InitDB() {
	// time.Sleep(5 * time.Second) // Đợi 5 giây trước khi kết nối đến DB
	var err error
	dsnList := []string{
		"root:123@tcp(db:3306)/restaurant_bookings?parseTime=true",
		"root:123@tcp(localhost:3306)/restaurant_bookings?parseTime=true",
	}

	for _, dsn := range dsnList {
		DB, err = sql.Open("mysql", dsn)
		if err != nil {
			fmt.Println("Error opening DB with DSN:", dsn, err)
			continue
		}

		err = DB.Ping()
		if err != nil {
			fmt.Println("Cannot ping DB with DSN:", dsn, err)
			continue
		}

		IsDBConnected = true
		fmt.Println("Connected and pinged DB successfully with DSN:", dsn)
		break
	}

	if !IsDBConnected {
		fmt.Println("Failed to connect to any DB instance")
	}

	DB.SetMaxOpenConns(10)
	DB.SetMaxIdleConns(5)

	createTable()
}

func createTable() {

	ImageQuery := `
	CREATE TABLE IF NOT EXISTS images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_data LONGBLOB NOT NULL
	);
	`
	_, err := DB.Exec(ImageQuery)
	if err != nil {
		panic(err)
	}

	CustomerQuery := `
	CREATE TABLE IF NOT EXISTS customers (
		id INTEGER PRIMARY KEY AUTO_INCREMENT,
		gmail VARCHAR(50) NOT NULL UNIQUE,
		name NVARCHAR(50) NOT NULL, 
		phone VARCHAR(50) NOT NULL,
		password VARCHAR(64) NOT NULL,
		status VARCHAR(10) NOT NULL,
		image_id INTEGER,
		FOREIGN KEY (image_id) REFERENCES images(id)
	)	
	`
	_, err = DB.Exec(CustomerQuery)
	if err != nil {
		panic(err)
	}

	AdminQuery := `
	CREATE TABLE IF NOT EXISTS admin (
		id INTEGER PRIMARY KEY AUTO_INCREMENT,
		gmail VARCHAR(50) NOT NULL UNIQUE,
		name NVARCHAR(50) NOT NULL, 
		phone VARCHAR(50) NOT NULL,
		password VARCHAR(64) NOT NULL
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
		password VARCHAR(64) NOT NULL,
		status VARCHAR(10) NOT NULL,
		image_id INTEGER,
		FOREIGN KEY (image_id) REFERENCES images(id)
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
		description TEXT,
		time_start TIME NOT NULL,
		time_end TIME NOT NULL,
		location TEXT NOT NULL,
		owner_id INTEGER NOT NULL,
		FOREIGN KEY (owner_id) REFERENCES owners(id),
		image_id INTEGER,
		FOREIGN KEY (image_id) REFERENCES images(id)
	)	
	`
	_, err = DB.Exec(RestaurantQuery)
	if err != nil {
		panic(err)
	}

	StaffQuery := `
	CREATE TABLE IF NOT EXISTS staffs (
		id INTEGER PRIMARY KEY AUTO_INCREMENT,
		gmail VARCHAR(50) NOT NULL,
		name NVARCHAR(50) NOT NULL, 
		phone VARCHAR(50) NOT NULL,
		status VARCHAR(10) NOT NULL,
		password VARCHAR(64) NOT NULL,
		restaurant_id INTEGER NOT NULL,
		FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
		image_id INTEGER,
		FOREIGN KEY (image_id) REFERENCES images(id)
	)`
	_, err = DB.Exec(StaffQuery)
	if err != nil {
		panic(err)
	}

	TableQuery := `
	CREATE TABLE IF NOT EXISTS tables (
		id INTEGER PRIMARY KEY AUTO_INCREMENT,
		name NVARCHAR(50) NOT NULL, 
		type NVARCHAR(50) NOT NULL,
		seats INTEGER NOT NULL,
		description TEXT NOT NULL,
		restaurant_id INTEGER NOT NULL,
		FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
		image_id INTEGER,
		FOREIGN KEY (image_id) REFERENCES images(id)
	)	
	`
	_, err = DB.Exec(TableQuery)
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
		actual_end TIME,
		price FLOAT,
		customer_email VARCHAR(50) NOT NULL,
		table_id INTEGER NOT NULL,
		FOREIGN KEY (table_id) REFERENCES tables(id),
		staff_id INTEGER, 	
		FOREIGN KEY (staff_id) REFERENCES staffs(id),
		customer_id INTEGER,
		FOREIGN KEY (customer_id) REFERENCES customers(id),
		status INTEGER NOT NULL
	)	
	`
	_, err = DB.Exec(ReservationQuery)
	if err != nil {
		panic(err)
	}

	revenuesQuery := `
	CREATE TABLE IF NOT EXISTS revenues(
	id INTEGER PRIMARY KEY AUTO_INCREMENT,
	weekly_revenues FLOAT NOT NULL,
	staff_adding INTEGER NOT NULL,
	staff_out INTEGER NOT NULL,
	order_done INTEGER NOT NULL,
	order_cancel INTEGER NOT NULL,
	order_customer INTEGER NOT NULL,
	using_customer INTEGER NOT NULL,
	owner_id INTEGER UNIQUE NOT NULL,
	FOREIGN KEY (owner_id) REFERENCES owners(id)
	)
	`
	_, err = DB.Exec(revenuesQuery)
	if err != nil {
		panic(err)
	}

	revenuesAdminQuery := `
	CREATE TABLE IF NOT EXISTS revenueAdmin(
	id INTEGER PRIMARY KEY AUTO_INCREMENT,
	weekly_revenues FLOAT NOT NULL,
	new_acc INTEGER NOT NULL,
	penal_acc INTEGER NOT NULL,
	order_done INTEGER NOT NULL,
	order_cancel INTEGER NOT NULL,
	order_customer INTEGER NOT NULL,
	using_customer INTEGER NOT NULL,
	admin_id INTEGER UNIQUE NOT NULL,
	FOREIGN KEY (admin_id) REFERENCES admin(id)
	)
	`
	_, err = DB.Exec(revenuesAdminQuery)
	if err != nil {
		panic(err)
	}
}
