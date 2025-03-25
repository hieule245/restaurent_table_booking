package services

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/db"
	"github.com/restaurent_table_booking/internal/models"
)

// Lấy danh sách nhân viên
func GetAllStaffs(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, gmail, name, phone, status, restaurant_id FROM staffs")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var staffs []models.Staff
	for rows.Next() {
		var staff models.Staff
		if err := rows.Scan(&staff.ID, &staff.Gmail, &staff.Name, &staff.Phone, &staff.Status, &staff.RestaurantID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		staffs = append(staffs, staff)
	}

	c.JSON(http.StatusOK, staffs)
}

// Lấy thông tin nhân viên theo ID
func GetStaffByID(c *gin.Context) {
	staffID := c.Param("staff_id")
	var staff models.Staff
	err := db.DB.QueryRow("SELECT id, gmail, name, phone, status, restaurant_id FROM staffs WHERE id = ?", staffID).
		Scan(&staff.ID, &staff.Gmail, &staff.Name, &staff.Phone, &staff.Status, &staff.RestaurantID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Staff not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	c.JSON(http.StatusOK, staff)
}

// Tạo nhân viên mới
func CreateStaff(c *gin.Context) {
	var staff models.Staff
	if err := c.ShouldBindJSON(&staff); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	result, err := db.DB.Exec("INSERT INTO staffs (gmail, name, phone, status, password, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)",
		staff.Gmail, staff.Name, staff.Phone, staff.Status, staff.Password, staff.RestaurantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	insertedID, _ := result.LastInsertId()
	staff.ID = int(insertedID)

	c.JSON(http.StatusCreated, staff)
}

// Sửa thông tin nhân viên
func EditStaff(c *gin.Context) {
	staffID := c.Param("staff_id")
	var staff models.Staff
	if err := c.ShouldBindJSON(&staff); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	_, err := db.DB.Exec("UPDATE staffs SET gmail=?, name=?, phone=?, status=?, restaurant_id=? WHERE id=?",
		staff.Gmail, staff.Name, staff.Phone, staff.Status, staff.RestaurantID, staffID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Staff updated successfully"})
}

// Xóa nhân viên
func DeleteStaff(c *gin.Context) {
	staffID := c.Param("staff_id")

	_, err := db.DB.Exec("DELETE FROM staffs WHERE id = ?", staffID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Staff deleted successfully"})
}

// Tìm kiếm nhân viên
func SearchStaffs(c *gin.Context) {
	query := c.Query("q")
	rows, err := db.DB.Query("SELECT id, gmail, name, phone, status, restaurant_id FROM staffs WHERE name LIKE ? OR gmail LIKE ?", "%"+query+"%", "%"+query+"%")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var staffs []models.Staff
	for rows.Next() {
		var staff models.Staff
		if err := rows.Scan(&staff.ID, &staff.Gmail, &staff.Name, &staff.Phone, &staff.Status, &staff.RestaurantID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		staffs = append(staffs, staff)
	}

	c.JSON(http.StatusOK, staffs)
}
