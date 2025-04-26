package services

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/db"
	"github.com/restaurent_table_booking/internal/models"
	"github.com/restaurent_table_booking/internal/utils"
)

// Lấy danh sách nhân viên
func GetAllStaffs(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, gmail, name, phone, status, restaurant_id FROM staffs")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer func() {
		if err := rows.Close(); err != nil {
			fmt.Println("Error closing stmt:", err)
		}
	}()

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
func CreateStaff(context *gin.Context) {
	var staff *models.Staff
	err := context.ShouldBindBodyWithJSON(&staff)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	_, userId := CurrentUser(context)
	var acc models.Account
	acc.Email = staff.Gmail
	_, ok := models.CheckAccount(&acc)
	if !ok {
		context.JSON(http.StatusConflict, gin.H{"error": "This account was created before!"})
		return
	}
	err = staff.CreateStaff(userId)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	context.JSON(http.StatusCreated, staff)
}

// Sửa thông tin nhân viên
func EditStaff(c *gin.Context) {
	staffID := c.Param("staff_id")
	var staff models.Staff
	if err := c.ShouldBindBodyWithJSON(&staff); err != nil {
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
	defer func() {
		if err := rows.Close(); err != nil {
			fmt.Println("Error closing stmt:", err)
		}
	}()

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

func GetStaffByRestaurantId(context *gin.Context) {
	var staff []models.Staff
	restaurantId, err := strconv.ParseInt(context.Param("restaurant_id"), 10, 64)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't take input information"})
	}
	staff, err = models.GetAllStaffEachRestaurant(restaurantId)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Can't get information in database"})
	}
	context.JSON(http.StatusOK, gin.H{"staff": staff})
}

func LockStaff(context *gin.Context) {
	var staff models.Staff
	_, userId := CurrentUser(context)
	err := context.ShouldBindBodyWithJSON(&staff)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't take input information"})
		return
	}
	switch staff.Status {
	case "active":
		err = models.LockStaff(userId, staff.ID)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}
		context.JSON(http.StatusOK, gin.H{"message": "Lock successfully!!!"})
	case "inactive":
		err = models.UnlockStaff(userId, staff.ID)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}
		context.JSON(http.StatusOK, gin.H{"message": "Unlock successfully!!!"})
	case "ban":
		context.JSON(http.StatusBadRequest, gin.H{"message": "This account was banned by admin"})
	default:
		context.JSON(http.StatusBadRequest, gin.H{"error": "Can catch status of this account"})
	}
}

func CurrentUser(context *gin.Context) (string, int64) {
	token, err := context.Cookie("token")
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		context.Abort()
		return "", 0
	}
	claims, err := utils.ParseJWT(token)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Claim failse"})
		context.Abort()
		return "", 0
	}
	userGmail := claims.Gmail
	userId := claims.UserID
	return userGmail, userId
}

func GetRestaurantByStaffID(context *gin.Context) {
	_, staffId := CurrentUser(context)
	res := &models.Restaurant{}
	err := res.GetRestaurantByStaffID(staffId)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Can't get information in database"})
		return
	}
	context.JSON(http.StatusOK, gin.H{"restaurant": res})
}

func GetTablesByRestaurantID(context *gin.Context) {
	restaurantId := context.Param("restaurant_id")
	var tables []models.Table
	resId, err := strconv.ParseInt(restaurantId, 10, 64)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't parse restaurant id"})
		return
	}
	tables, err = models.GetTablesByRestaurantID(int(resId))
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Can't get information in database"})
		return
	}
	context.JSON(http.StatusOK, gin.H{"tables": tables})
}

func GetReservationByRestaurantID(context *gin.Context) {
	_, staffId := CurrentUser(context)
	res := &models.Restaurant{}
	err := res.GetRestaurantByStaffID(staffId)
	var reservation []models.Reservations
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't parse restaurant id"})
		return
	}
	reservation, err = models.GetReservationByRestaurantID(res.Id)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Can't get information in database"})
		return
	}
	context.JSON(http.StatusOK, gin.H{"reservation": reservation})
}
