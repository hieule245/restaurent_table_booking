package models

type Staff struct {
	ID           int    `json:"id"`
	Gmail        string `json:"gmail"`
	Name         string `json:"name"`
	Phone        string `json:"phone"`
	Status       string `json:"status"`
	Password     string `json:"-"`
	RestaurantID int    `json:"restaurant_id"`
}
