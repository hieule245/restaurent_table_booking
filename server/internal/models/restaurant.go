package models

import (
	"errors"
	"fmt"

	"github.com/restaurent_table_booking/internal/db"
)

type Restaurant struct {
	Id          int64
	Name        string
	Description string
	Started     string
	Ended       string
	Owner_id    int
}

func GetAllRestaurants() ([]Restaurant, error) {
	var res []Restaurant
	query := `SELECT * FROM restaurants`
	rows, err := db.DB.Query(query)
	if err != nil {
		return res, errors.New("Can't catch any information")
	}
	defer rows.Close()

	for rows.Next() {
		var e Restaurant
		err = rows.Scan(&e.Id, &e.Name, &e.Description, &e.Started, &e.Ended, &e.Owner_id)
		if err != nil { 
			return res, errors.New("Can't catch any information")
		}
		res = append(res, e)
	}
	return res, nil
}

func (r *Restaurant) CreateRestaurant() error {
	query := `
	INSERT INTO restaurants(name, description, time_start, time_end, owner_id)
	VALUES (?, ?, ?,?,?)`
	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()
	result, err := stmt.Exec(r.Name, r.Description, r.Started, r.Ended, r.Owner_id)
	fmt.Print(r.Owner_id)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	r.Id = id
	return nil
}
func GetRestaurantByID(id string) (Restaurant, error) {
	var r Restaurant
	query := `SELECT * FROM restaurants WHERE id = ?`
	err := db.DB.QueryRow(query, id).Scan(&r.Id, &r.Name, &r.Description, &r.Started, &r.Ended, &r.Owner_id)

	if err != nil {
		return r, errors.New("Restaurant not found")
	}

	return r, nil
}

func (r *Restaurant) UpdateRestaurant() error {
	query := `
		UPDATE restaurants 
		SET name = ?, description = ?, time_start = ?, time_end = ?
		WHERE id = ?`

	stmt, err := db.DB.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(r.Name, r.Description, r.Started, r.Ended, r.Id)
	if err != nil {
		return err
	}

	return nil
}

func DeleteRestaurantByID(id int64) error {
	query := `DELETE FROM restaurants WHERE id = ?`
	result, err := db.DB.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		return errors.New("restaurant not found")
	}

	return nil
}
