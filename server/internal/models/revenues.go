package models

import (
	"database/sql"
	"fmt"

	"github.com/restaurent_table_booking/internal/db"
)

type Revenues struct {
	WeeklyRevenue float32
	ActiveStaff   int // Số lượng nhân viên còn làm trong tuần
	OutStaff      int // Số lượng nhân viên nghỉ việc trong tuần
	CanceledBook  int // Số lượng đơn bị hủy trong tuần
	BookNumber    int // Số lượng đơn đặt bàn đã sử dụng trong tuần
	OrderCustomer int // Số lượng khách đặt trong tuần ( không trùng )
	UsingCustomer int // Số lượng khách tới quán trong tuần
}

// Lấy doanh thu tuần hiện tại
func (rev *Revenues) GetCurrentWeekRevenue(ownerId int64) error {
	query := `
	SELECT 
    SUM(b.price) AS total_price, 
    (SELECT COUNT(*) FROM staffs s 
     WHERE s.restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = o.id) 
     AND s.status = 'active') AS active_staffs,
    (SELECT COUNT(*) FROM staffs s 
     WHERE s.restaurant_id IN (SELECT r.id FROM restaurants r WHERE r.owner_id = o.id) 
     AND s.status = 'inactive') AS inactive_staffs,
    COUNT(DISTINCT CASE WHEN b.status = 0 THEN b.id ELSE NULL END) AS pending_reservations, 
    COUNT(DISTINCT CASE WHEN b.status != 0 THEN b.id ELSE NULL END) AS confirmed_reservations,
    COUNT(DISTINCT b.customer_id) AS unique_customers,
    SUM(b.numberOfCustomer) AS total_customers
	FROM reservations b 
	INNER JOIN tables t ON b.table_id = t.id 
	INNER JOIN restaurants r ON t.restaurant_id = r.id 
	INNER JOIN owners o ON r.owner_id = o.id 
	WHERE o.id = ?
	AND YEARWEEK(b.book_date, 1) = YEARWEEK(CURRENT_DATE(), 1)
	GROUP BY o.id;
	`
	row := db.DB.QueryRow(query, ownerId)
	err := row.Scan(&rev.WeeklyRevenue, &rev.ActiveStaff, &rev.OutStaff, &rev.CanceledBook, &rev.BookNumber, &rev.OrderCustomer, &rev.UsingCustomer)

	if err != nil {

		return err
	}

	return nil
}

func (rev *Revenues) GetLastRevenue(ownerId int64) error {
	query := `
	SELECT weekly_revenues, staff_adding, staff_out, order_done, order_cancel, order_customer, using_customer 
	FROM revenues
	WHERE owner_id = ? 
	`
	row := db.DB.QueryRow(query, ownerId)
	err := row.Scan(&rev.WeeklyRevenue, &rev.ActiveStaff, &rev.OutStaff, &rev.CanceledBook, &rev.BookNumber, &rev.OrderCustomer, &rev.UsingCustomer)

	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Println("This is first week")
		}
		return err
	}

	return nil
}

func CheckActive(ownerId int64) (bool, error) {
	var count int
	query := `
	SELECT COUNT(*) FROM restaurants
	WHERE owner_id = ?
	`
	row := db.DB.QueryRow(query, ownerId)
	err := row.Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (rev *Revenues) SaveCurrentRevenues(ownerId int64) error {
	query := `
	UPDATE revenues 
	SET
	weekly_revenues = ?,
	staff_adding = ?,
	staff_out = ?,
	order_done = ?, 
	order_cancel = ?, 
	order_customer = ?, 
	using_customer = ?
	WHERE owner_id = ?
	`

	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return err
	}

	defer stmt.Close()

	_, err = stmt.Exec(rev.WeeklyRevenue, rev.ActiveStaff, rev.OutStaff, rev.BookNumber, rev.CanceledBook, rev.OrderCustomer, rev.UsingCustomer, ownerId)
	if err != nil {
		return err
	}

	return nil
}

func (rev *Revenues) SaveNewCurrentRevenues(ownerId int64) error {
	query := `
	INSERT INTO revenues (weekly_revenues, staff_adding, staff_out, order_done, order_cancel, order_customer, using_customer, owner_id)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`

	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return err
	}

	defer stmt.Close()

	_, err = stmt.Exec(rev.WeeklyRevenue, rev.ActiveStaff, rev.OutStaff, rev.BookNumber, rev.CanceledBook, rev.OrderCustomer, rev.UsingCustomer, ownerId)
	if err != nil {
		return err
	}

	return nil
}
