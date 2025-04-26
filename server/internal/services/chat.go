package services

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/db"
)

type ChatPerson struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Role string `json:"role"`
}

func GetChatPeople(c *gin.Context) {
	role := c.Query("role")
	idStr := c.Query("user_id")
	userID, err := strconv.Atoi(idStr)
	if err != nil || (role != "customer" && role != "owner" && role != "admin") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role or user_id"})
		return
	}

	var results []ChatPerson
	var rows *sql.Rows

	switch role {
	case "customer":
		query := `
		SELECT DISTINCT o.id, o.name, 'owner' as role
		FROM reservations r
		JOIN tables t ON r.table_id = t.id
		JOIN restaurants rs ON t.restaurant_id = rs.id
		JOIN owners o ON rs.owner_id = o.id
		WHERE r.customer_id = ?
		UNION
		SELECT a.id, a.name, 'admin' as role
		FROM admin a
		`
		rows, err = db.DB.Query(query, userID)

	case "owner":
		query := `
		SELECT DISTINCT c.id, c.name, 'customer' as role
		FROM reservations r
		JOIN tables t ON r.table_id = t.id
		JOIN restaurants rs ON t.restaurant_id = rs.id
		JOIN customers c ON r.customer_id = c.id
		WHERE rs.owner_id = ?
		UNION
		SELECT a.id, a.name, 'admin' as role
		FROM admin a
		`
		rows, err = db.DB.Query(query, userID)

	case "admin":
		query := `
		SELECT id, name, 'customer' as role FROM customers
		UNION
		SELECT id, name, 'owner' as role FROM owners`
		rows, err = db.DB.Query(query)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch people"})
		return
	}
	defer func() {
		if err := rows.Close(); err != nil {
			fmt.Println("Error closing:", err)
		}
	}()

	for rows.Next() {
		var p ChatPerson
		if err := rows.Scan(&p.ID, &p.Name, &p.Role); err != nil {
			continue
		}
		results = append(results, p)
	}

	c.JSON(http.StatusOK, results)
}
