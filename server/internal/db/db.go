package db

import (
	"database/sql"
	"log"

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
		password VARCHAR(64) NOT NULL,
		status VARCHAR(10) NOT NULL
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
		status VARCHAR(10) NOT NULL
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
		status VARCHAR(10) NOT NULL,
		password VARCHAR(64) NOT NULL,
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
		type NVARCHAR(50) NOT NULL,
		seats INTEGER NOT NULL,
		description TEXT NOT NULL,
		restaurant_id INTEGER NOT NULL,
		FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
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
	insertSampleData()
}

func insertSampleData() {
	// Chọn cơ sở dữ liệu
	_, err := DB.Exec("USE restaurant_bookings;")
	if err != nil {
		log.Fatal("Error selecting database:", err)
	}

	// Xóa dữ liệu cũ (theo thứ tự ngược lại)
	_, err = DB.Exec("DELETE FROM reservations;")
	if err != nil {
		log.Fatal("Error deleting reservations:", err)
	}
	_, err = DB.Exec("DELETE FROM staffs;")
	if err != nil {
		log.Fatal("Error deleting staffs:", err)
	}
	_, err = DB.Exec("DELETE FROM tables;")
	if err != nil {
		log.Fatal("Error deleting tables:", err)
	}
	_, err = DB.Exec("DELETE FROM restaurants;")
	if err != nil {
		log.Fatal("Error deleting restaurants:", err)
	}
	_, err = DB.Exec("DELETE FROM owners;")
	if err != nil {
		log.Fatal("Error deleting owners:", err)
	}
	_, err = DB.Exec("DELETE FROM admin;")
	if err != nil {
		log.Fatal("Error deleting admin:", err)
	}
	_, err = DB.Exec("DELETE FROM customers;")
	if err != nil {
		log.Fatal("Error deleting customers:", err)
	}

	// Query thêm dữ liệu vào bảng customers
	InsertCustomerQuery := `
INSERT INTO customers (id, gmail, name, phone, password, status) VALUES
  (1, 'user1@gmail.com', 'User One', '0123456789', 'hashed_password1', 'active'),
  (2, 'user2@gmail.com', 'User Two', '0987654321', 'hashed_password2', 'inactive'),
  (3, 'user3@gmail.com', 'User Three', '0112233445', 'hashed_password3', 'active'),
  (4, 'user4@gmail.com', 'User Four', '0223344556', 'hashed_password4', 'active'),
  (5, 'user5@gmail.com', 'User Five', '0334455667', 'hashed_password5', 'inactive'),
  (6, 'user6@gmail.com', 'User Six', '0445566778', 'hashed_password6', 'active'),
  (7, 'user7@gmail.com', 'User Seven', '0556677889', 'hashed_password7', 'active'),
  (8, 'user8@gmail.com', 'User Eight', '0667788990', 'hashed_password8', 'inactive'),
  (9, 'user9@gmail.com', 'User Nine', '0778899001', 'hashed_password9', 'active'),
  (10, 'user10@gmail.com', 'User Ten', '0889900112', 'hashed_password10', 'active');
`
	_, err = DB.Exec(InsertCustomerQuery)
	if err != nil {
		log.Fatal("Error inserting customers:", err)
	}

	// Query thêm dữ liệu vào bảng admin
	InsertAdminQuery := `
INSERT INTO admin (id, gmail, name, phone, password) VALUES
  (1, 'admin1@gmail.com', 'Admin One', '0912345678', 'hashed_admin1'),
  (2, 'admin2@gmail.com', 'Admin Two', '0923456789', 'hashed_admin2'),
  (3, 'admin3@gmail.com', 'Admin Three', '0934567890', 'hashed_admin3'),
  (4, 'admin4@gmail.com', 'Admin Four', '0945678901', 'hashed_admin4'),
  (5, 'admin5@gmail.com', 'Admin Five', '0956789012', 'hashed_admin5'),
  (6, 'admin6@gmail.com', 'Admin Six', '0967890123', 'hashed_admin6'),
  (7, 'admin7@gmail.com', 'Admin Seven', '0978901234', 'hashed_admin7'),
  (8, 'admin8@gmail.com', 'Admin Eight', '0989012345', 'hashed_admin8'),
  (9, 'admin9@gmail.com', 'Admin Nine', '0990123456', 'hashed_admin9'),
  (10, 'admin10@gmail.com', 'Admin Ten', '0901234567', 'hashed_admin10');
`
	_, err = DB.Exec(InsertAdminQuery)
	if err != nil {
		log.Fatal("Error inserting admin:", err)
	}

	// Query thêm dữ liệu vào bảng owners
	InsertOwnerQuery := `
INSERT INTO owners (id, gmail, name, phone, password, status) VALUES
  (1, 'owner1@gmail.com', 'Owner One', '0812345678', 'hashed_owner1', 'active'),
  (2, 'owner2@gmail.com', 'Owner Two', '0823456789', 'hashed_owner2', 'active'),
  (3, 'owner3@gmail.com', 'Owner Three', '0834567890', 'hashed_owner3', 'inactive'),
  (4, 'owner4@gmail.com', 'Owner Four', '0845678901', 'hashed_owner4', 'active'),
  (5, 'owner5@gmail.com', 'Owner Five', '0856789012', 'hashed_owner5', 'inactive'),
  (6, 'owner6@gmail.com', 'Owner Six', '0867890123', 'hashed_owner6', 'active'),
  (7, 'owner7@gmail.com', 'Owner Seven', '0878901234', 'hashed_owner7', 'active'),
  (8, 'owner8@gmail.com', 'Owner Eight', '0889012345', 'hashed_owner8', 'inactive'),
  (9, 'owner9@gmail.com', 'Owner Nine', '0890123456', 'hashed_owner9', 'active'),
  (10, 'owner10@gmail.com', 'Owner Ten', '0801234567', 'hashed_owner10', 'active');
`
	_, err = DB.Exec(InsertOwnerQuery)
	if err != nil {
		log.Fatal("Error inserting owners:", err)
	}

	// Query thêm dữ liệu vào bảng restaurants
	InsertRestaurantQuery := `
INSERT INTO restaurants (id, name, description, time_start, time_end, location, owner_id) VALUES
  (1, 'Restaurant One', 'Best food in town', '08:00:00', '22:00:00', '123 Main St', 1),
  (2, 'Restaurant Two', 'Fine dining experience', '09:00:00', '23:00:00', '456 Oak St', 2),
  (3, 'Restaurant Three', 'Cozy and friendly', '10:00:00', '21:00:00', '789 Pine St', 3),
  (4, 'Restaurant Four', 'Authentic flavors', '07:30:00', '20:30:00', '101 Maple St', 4),
  (5, 'Restaurant Five', 'Seafood heaven', '11:00:00', '22:30:00', '202 Elm St', 5),
  (6, 'Restaurant Six', 'Fast and tasty', '06:00:00', '23:00:00', '303 Birch St', 6),
  (7, 'Restaurant Seven', 'Traditional meals', '08:30:00', '22:00:00', '404 Cedar St', 7),
  (8, 'Restaurant Eight', 'Vegetarian delight', '09:00:00', '21:00:00', '505 Walnut St', 8),
  (9, 'Restaurant Nine', 'International cuisine', '07:00:00', '23:30:00', '606 Ash St', 9),
  (10, 'Restaurant Ten', 'Best steaks', '10:00:00', '23:00:00', '707 Poplar St', 10);
`
	_, err = DB.Exec(InsertRestaurantQuery)
	if err != nil {
		log.Fatal("Error inserting restaurants:", err)
	}

	// Query thêm dữ liệu vào bảng staffs
	InsertStaffQuery := `
INSERT INTO staffs (id, gmail, name, phone, status, password, restaurant_id) VALUES
  (1, 'staff1@gmail.com', 'Staff One', '0712345678', 'active', 'hashed_staff1', 1),
  (2, 'staff2@gmail.com', 'Staff Two', '0723456789', 'active', 'hashed_staff2', 2),
  (3, 'staff3@gmail.com', 'Staff Three', '0734567890', 'inactive', 'hashed_staff3', 3),
  (4, 'staff4@gmail.com', 'Staff Four', '0745678901', 'active', 'hashed_staff4', 4),
  (5, 'staff5@gmail.com', 'Staff Five', '0756789012', 'active', 'hashed_staff5', 5),
  (6, 'staff6@gmail.com', 'Staff Six', '0767890123', 'inactive', 'hashed_staff6', 6),
  (7, 'staff7@gmail.com', 'Staff Seven', '0778901234', 'active', 'hashed_staff7', 7),
  (8, 'staff8@gmail.com', 'Staff Eight', '0789012345', 'inactive', 'hashed_staff8', 8),
  (9, 'staff9@gmail.com', 'Staff Nine', '0790123456', 'active', 'hashed_staff9', 9),
  (10, 'staff10@gmail.com', 'Staff Ten', '0701234567', 'active', 'hashed_staff10', 10);
`
	_, err = DB.Exec(InsertStaffQuery)
	if err != nil {
		log.Fatal("Error inserting staffs:", err)
	}

	// Query thêm dữ liệu vào bảng tables
	InsertTablesQuery := `
INSERT INTO tables (id, name, type, seats, description, restaurant_id) VALUES
  (1, 'Table 1', 'VIP', 4, 'Cozy VIP table', 1),
  (2, 'Table 2', 'Standard', 2, 'Small table for couples', 1),
  (3, 'Table 3', 'Family', 6, 'Large table for families', 2),
  (4, 'Table 4', 'Outdoor', 4, 'Scenic outdoor seating', 3),
  (5, 'Table 5', 'Booth', 4, 'Comfortable booth seating', 4),
  (6, 'Table 6', 'Standard', 2, 'Window view table', 5),
  (7, 'Table 7', 'VIP', 6, 'Exclusive private area', 6),
  (8, 'Table 8', 'Family', 8, 'Big family table', 7),
  (9, 'Table 9', 'Outdoor', 4, 'Shaded patio seating', 8),
  (10, 'Table 10', 'Booth', 4, 'Quiet corner booth', 9);
`
	_, err = DB.Exec(InsertTablesQuery)
	if err != nil {
		log.Fatal("Error inserting tables:", err)
	}

	// Query thêm dữ liệu vào bảng reservations
	InsertReservationQuery := `
INSERT INTO reservations (numberOfCustomer, book_date, time_start, time_end, actual_end, price, customer_email, table_id, staff_id, customer_id, status) VALUES
  ('2', '2025-03-21', '19:00:00', '21:00:00', '2025-03-21 21:15:00', 50.00, 'user1@gmail.com', 1, 1, 1, 1),
  ('4', '2025-03-22', '18:00:00', '20:00:00', '2025-03-22 20:10:00', 80.00, 'user2@gmail.com', 2, 2, 2, 1),
  ('6', '2025-03-23', '20:00:00', '22:00:00', '2025-03-23 22:30:00', 120.00, 'user3@gmail.com', 3, 3, 3, 1),
  ('3', '2025-03-24', '19:30:00', '21:30:00', '2025-03-24 21:45:00', 70.00, 'user4@gmail.com', 4, 4, 4, 1),
  ('5', '2025-03-25', '18:30:00', '20:30:00', '2025-03-25 20:50:00', 90.00, 'user5@gmail.com', 5, 5, 5, 1),
  ('2', '2025-03-26', '20:00:00', '22:00:00', '2025-03-26 22:05:00', 50.00, 'user6@gmail.com', 6, 6, 6, 1),
  ('4', '2025-03-27', '19:00:00', '21:00:00', '2025-03-27 21:20:00', 85.00, 'user7@gmail.com', 7, 7, 7, 1),
  ('6', '2025-03-28', '18:00:00', '20:00:00', '2025-03-28 20:15:00', 120.00, 'user8@gmail.com', 8, 8, 8, 1),
  ('3', '2025-03-29', '19:30:00', '21:30:00', '2025-03-29 21:40:00', 65.00, 'user9@gmail.com', 9, 9, 9, 1),
  ('5', '2025-03-30', '20:00:00', '22:00:00', '2025-03-30 22:25:00', 95.00, 'user10@gmail.com', 10, 10, 10, 1);
`
	_, err = DB.Exec(InsertReservationQuery)
	if err != nil {
		log.Fatal("Error inserting reservations:", err)
	}
}
