package cronjobs

import (
	"fmt"

	"github.com/restaurent_table_booking/internal/services"
	"github.com/robfig/cron/v3"
)

func CronCalculation() {
	c := cron.New(cron.WithSeconds())
	// Dùng để test
	// _, err := c.AddFunc("*/30 * * * * *", services.WeeklyRevenue)
	_, err := c.AddFunc("0 20 * * * 1", services.WeeklyRevenue)
	if err != nil {
		fmt.Println("Can't run in the background because ", err)
		return
	}
	c.Start()
	select {}
}

