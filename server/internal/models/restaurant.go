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
	Owner_id    int64
	Location    string
}

func SearchRestaurants(id int64, name, location string, ownerID int) ([]Restaurant, error) {
	var restaurants []Restaurant
	query := "SELECT * FROM restaurants WHERE 1=1" // 1=1 để dễ dàng thêm điều kiện

	var args []interface{}

	if id != 0 {
		query += " AND id = ?"
		args = append(args, id)
	}
	if name != "" {
		query += " AND name LIKE ?"
		args = append(args, "%"+name+"%")
	}
	if location != "" {
		query += " AND location LIKE ?"
		args = append(args, "%"+location+"%")
	}
	if ownerID > 0 {
		query += " AND owner_id = ?"
		args = append(args, ownerID)
	}

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var r Restaurant
		var locationBytes []byte
		if err := rows.Scan(&r.Id, &r.Name, &r.Description, &r.Started, &r.Ended, &locationBytes, &r.Owner_id); err != nil {
			return nil, err
		}
		r.Location = string(locationBytes)
		restaurants = append(restaurants, r)
	}

	return restaurants, nil
}

func GetAllRestaurants() ([]Restaurant, error) {
	var res []Restaurant
	query := `SELECT * FROM restaurants`
	rows, err := db.DB.Query(query)
	if err != nil {
		return res, errors.New("can't catch any information")
	}
	defer rows.Close()

	for rows.Next() {
		var e Restaurant
		err = rows.Scan(&e.Id, &e.Name, &e.Description, &e.Started, &e.Ended, &e.Location, &e.Owner_id)
		if err != nil {
			return res, errors.New("can't catch any information")
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
	result, err := stmt.Exec(r.Name, r.Description, r.Started, r.Ended, r.Owner_id, r.Location)
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

// alpha

func GetRestaurantByOwnerID(id int64) (error, []Restaurant) {
	var res []Restaurant
	query := `
	SELECT * FROM restaurants
	WHERE owner_id = ?
	`
	rows, err := db.DB.Query(query, id)
	if err != nil {
		return err, nil
	}

	defer rows.Close()

	for rows.Next() {
		var e Restaurant
		err := rows.Scan(&e.Id, &e.Name, &e.Location, &e.Description, &e.Started, &e.Ended)
		if err != nil {
			return err, nil
		}
		res = append(res, e)
	}
	return nil, res
}
