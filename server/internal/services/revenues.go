package services

import (
	"database/sql"
	"fmt"

	"github.com/restaurent_table_booking/internal/db"
	"github.com/restaurent_table_booking/internal/models"
	pkg "github.com/restaurent_table_booking/pkg/email"
)

func WeeklyRevenue() {
	query := `
	SELECT id, name, gmail FROM owners
	`
	rows, err := db.DB.Query(query)
	if err != nil {
		fmt.Println("1-", err)
		return
	} 
	defer rows.Close()
	for rows.Next() {
		var ownerId int64
		var ownerName, ownerGmail string
		err := rows.Scan(&ownerId, &ownerName, &ownerGmail)
		if err != nil {
			fmt.Println("2-", err)
			return
		}

		// Kiểm tra xem trong tuần vừa qua owner có hoạt động trên web ko, nếu ko có bất kì nhà hàng nào thì sẽ ko gửi mail về
		isActive, err := models.CheckActive(ownerId)
		if err != nil {
			fmt.Println("9 user-", err)
		}

		if isActive == false {
			fmt.Println("No active this week...", ownerId, ", skipping...")
			continue
		}
		// Lấy dữ liệu tháng hiện tại
		curRevenues := &models.Revenues{}
		err = curRevenues.GetCurrentWeekRevenue(ownerId)
		if err != nil {
			if err == sql.ErrNoRows {

			} else {
				fmt.Println("4-", err)
				return
			}
		}

		// Lấy dữ liệu tháng trước
		lastRevenues := &models.Revenues{}
		err = lastRevenues.GetLastRevenue(ownerId)
		if err != nil {
			if err == sql.ErrNoRows {
				err := curRevenues.SaveNewCurrentRevenues(ownerId)
				if err != nil {
					fmt.Println("5-", err)
					return
				}
				MonthlyNewReport(ownerGmail, ownerName, curRevenues)
			} else {
				fmt.Println("7-", err)
				return
			}
		} else {
			MonthlyReport(ownerGmail, ownerName, curRevenues, lastRevenues)
			err := curRevenues.SaveCurrentRevenues(ownerId)
			if err != nil {
				fmt.Println("6-", err)
				return
			}
		}
	}
}

func MonthlyReport(gmail, name string, currentRevenue, lastRevenues *models.Revenues) {
	// Chênh lệch so với tháng trước
	RevenueChange := currentRevenue.WeeklyRevenue - lastRevenues.WeeklyRevenue
	fmt.Printf("dif: %1.f, cur: %.1f, last: %.1f", RevenueChange, currentRevenue.WeeklyRevenue, lastRevenues.WeeklyRevenue)
	var RevenueChangeStr string
	if RevenueChange > 0 {
		RevenueChangeStr = fmt.Sprintf("tăng %.1fVND", RevenueChange)
	} else if RevenueChange < 0 {
		RevenueChangeStr = fmt.Sprintf("giảm %.1fVND", -RevenueChange)
	} else if RevenueChange == 0 {
		RevenueChangeStr = "không thay đổi"
	}

	// Số lượng nhân viên mới
	newStaff := (currentRevenue.ActiveStaff + currentRevenue.OutStaff) - (lastRevenues.ActiveStaff + lastRevenues.OutStaff)
	newOutStaff := currentRevenue.OutStaff - lastRevenues.OutStaff

	pkg.SendMailRevenues(gmail, name, RevenueChangeStr, currentRevenue.WeeklyRevenue, newStaff, newOutStaff, currentRevenue.OrderCustomer, currentRevenue.UsingCustomer)
}

func MonthlyNewReport(gmail, name string, currentRevenue *models.Revenues) {
	pkg.SendMailRevenues(gmail, name, " đây là tuần đầu tiên", currentRevenue.WeeklyRevenue, currentRevenue.ActiveStaff, currentRevenue.OutStaff, currentRevenue.OrderCustomer, currentRevenue.UsingCustomer)
}
