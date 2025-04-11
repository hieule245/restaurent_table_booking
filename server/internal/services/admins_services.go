package services

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
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
		err = models.LockStaffByAdmin(acc.Id)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}
		context.JSON(http.StatusOK, gin.H{"message": "Lock successfully!!!"})
	} else {
		err = models.UnlockStaffByAdmin(acc.Id)
		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}
		context.JSON(http.StatusOK, gin.H{"message": "Unlock successfully!!!"})
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
	context.JSON(200, gin.H{"message": "ok"})

}
func AdminGetTables(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

}
func AdminGetTable(context *gin.Context) {
	context.JSON(200, gin.H{"message": "ok"})

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
