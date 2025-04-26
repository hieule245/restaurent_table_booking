package services

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/db"
	"github.com/restaurent_table_booking/internal/models"
	"github.com/restaurent_table_booking/internal/utils"
)

func AdminGetUsers(context *gin.Context) {
	acc, err := models.GetAllAccounts()
	if err != nil {
		context.JSON(http.StatusBadGateway, gin.H{"message": err.Error()})
		return
	}
	context.JSON(http.StatusOK, gin.H{"account": acc})
}

func AdminGetUser(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})
}

func LockAccount(context *gin.Context) {
	var acc models.Account
	err := context.ShouldBindBodyWithJSON(&acc)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't take input information"})
		return
	}
	if acc.Status == "active" || acc.Status == "inactive" {
		fmt.Println("ban")
		err = models.BanByAdmin(acc.Email, acc.Role)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}
		context.JSON(http.StatusOK, gin.H{"message": "Ban successfully!!!"})
	} else {
		err = models.UnbanByAdmin(acc.Email, acc.Role)
		fmt.Println("unban", err)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}
		context.JSON(http.StatusOK, gin.H{"message": "Unban successfully!!!"})
	}
}

func AdminGetOwners(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}
func AdminGetOwner(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}
func AdminGetCustomers(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}
func AdminGetCustomer(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}
func AdminGetRestaurants(context *gin.Context) {
	var res []models.Restaurant
	res, err := models.GetAllRestaurants()
	if err != nil {
		context.JSON(http.StatusBadGateway, gin.H{"message": err.Error()})
		context.JSON(http.StatusBadGateway, gin.H{"message": "Can't take any restaurants"})
		return
	}
	context.JSON(http.StatusOK, gin.H{"restaurants": res})
}

func AdminGetRestaurant(context *gin.Context) {
	restaurantID := context.Param("restaurant_id") // Lấy ID từ URL
	restaurant, err := models.GetRestaurantByID(restaurantID)
	if err != nil {
		context.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"restaurant": restaurant})
}
func AdminEditRestaurant(context *gin.Context) {
	restaurantIDStr := context.Param("restaurant_id")

	restaurantID, err := strconv.ParseInt(restaurantIDStr, 10, 64)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid restaurant ID"})
		return
	}

	var updatedRestaurant models.Restaurant
	if err := context.ShouldBindJSON(&updatedRestaurant); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	updatedRestaurant.Id = restaurantID
	err = updatedRestaurant.UpdateRestaurant()
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update restaurant", "error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Restaurant updated successfully", "restaurant": updatedRestaurant})
}

func AdminGetTables(context *gin.Context) {
	restaurantID, err := strconv.ParseInt(context.Param("restaurant_id"), 10, 64)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid restaurant ID"})
		return
	}

	tables, err := models.GetAllTables(restaurantID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tables"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"tables": tables})
}

func AdminEditTable(context *gin.Context) {
	tableID, err := strconv.Atoi(context.Param("table_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid table ID"})
		return
	}
	var table models.Table
	err = context.ShouldBindJSON(&table)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}

	table.ID = tableID

	if err := table.UpdateTable(); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update table"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Table updated", "table": table})
}

func AdminDeleteTable(context *gin.Context) {
	tableID, err := strconv.Atoi(context.Param("table_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid table ID"})
		return
	}

	if err := models.DeleteTable(tableID); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete table"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Table deleted"})
}

func AdminGetTable(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}

func AdminGetStaffs(context *gin.Context) {
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

func AdminEditStaff(context *gin.Context) {
	staffID := context.Param("staff_id")
	var staff models.Staff
	if err := context.ShouldBindBodyWithJSON(&staff); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	_, err := db.DB.Exec("UPDATE staffs SET gmail=?, name=?, phone=?, status=?, restaurant_id=? WHERE id=?",
		staff.Gmail, staff.Name, staff.Phone, staff.Status, staff.RestaurantID, staffID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Staff updated successfully"})
}

func AdminBanStaff(context *gin.Context) {
	var staff models.Staff
	userGmail, userId := CurrentUser(context)
	err := context.ShouldBindBodyWithJSON(&staff)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't take input information"})
		return
	}
	switch staff.Status {
	case "active", "inactive":
		err = models.BanStaff(userGmail, userId, staff.ID)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}
		context.JSON(http.StatusOK, gin.H{"message": "Lock successfully!!!"})
	case "ban":
		err = models.UnlockStaff(userId, staff.ID)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}
		context.JSON(http.StatusOK, gin.H{"message": "Unlock successfully!!!"})
	}
}

func AdminDeleteRestaurant(context *gin.Context) {
	restaurantIDStr := context.Param("restaurant_id") // Lấy ID từ URL

	// Chuyển đổi restaurantID từ string -> int64
	restaurantID, err := strconv.ParseInt(restaurantIDStr, 10, 64)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid restaurant ID"})
		return
	}

	// Gọi hàm xóa nhà hàng trong models
	err = models.DeleteRestaurantByID(restaurantID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to delete restaurant", "error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Restaurant deleted successfully"})
}

func ReservationEachRestaurant(context *gin.Context) {
	token, err := context.Cookie("token")
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Can not get token from cookie"})
		context.Abort()
		return
	}
	claims, err := utils.ParseJWT(token)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Claim failse"})
		context.Abort()
		return
	}
	user_id := claims.UserID
	user_gmail := claims.Gmail
	var restaurant_id int
	restaurant_id, err = strconv.Atoi(context.Param("restaurant_id"))
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		context.Abort()
		return
	}
	reservation, err := models.GetBookingByRestaurantId(user_gmail, user_id, restaurant_id)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		context.Abort()
		return
	}
	context.JSON(http.StatusOK, gin.H{"booking": reservation})
}

func AdminEditReservations(context *gin.Context) {
	var res *models.Booking
	err := context.ShouldBindBodyWithJSON(&res)
	if err != nil {
		fmt.Println("1", err)
		context.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	err = res.EditCheckout()
	if err != nil {
		fmt.Println("3", err)
		context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Update successfully !!!"})
}

func AdminGetReservation(context *gin.Context) {
	reservation, err := models.GetBookingByAdmin()
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		context.Abort()
		return
	}
	context.JSON(http.StatusOK, gin.H{"booking": reservation})
}

func StaticRevenueByAdmin(context *gin.Context) {
	token, err := context.Cookie("token")
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Can not get token from cookie"})
		context.Abort()
		return
	}
	claims, err := utils.ParseJWT(token)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		context.Abort()
		return
	}

	curRev := &models.Revenues{}
	err = curRev.GetCurrentWeekRevenueAdmin()
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("1 revenues- %s", err.Error())})
		context.Abort()
		return
	}

	LastRev := &models.Revenues{}
	err = LastRev.GetLastRevenueAdmin(claims.UserID)
	fmt.Println("curRev", LastRev)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("2 revenues- %s", err.Error())})
		context.Abort()
		return
	}

	curRev.DiffTotal = percentChange(curRev.WeeklyRevenue, LastRev.WeeklyRevenue).(float32)
	curRev.DiffBookNumber = percentChange(curRev.BookNumber, LastRev.BookNumber).(int)
	curRev.DiffCanceledBook = percentChange(curRev.CanceledBook, LastRev.CanceledBook).(int)

	fmt.Println("diff", curRev.DiffTotal, curRev.DiffBookNumber, curRev.DiffCanceledBook)
	context.JSON(http.StatusOK, gin.H{"message": curRev})
}

func GetTopRestaurantRevenuesByAdmin(context *gin.Context) {
	var top []models.TopRestaurant
	top, err := models.GetTopRestaurantRevenuesByAdmin()
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		context.Abort()
		return
	}
	context.JSON(http.StatusOK, gin.H{"top": top})
}
