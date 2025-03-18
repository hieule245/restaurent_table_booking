package services

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/models"
	"github.com/restaurent_table_booking/internal/utils"
)

func Login(context *gin.Context) {
	var u models.Account
	err := context.ShouldBindBodyWithJSON(&u)
	if err != nil {
		panic(err)
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't read your input information"})
		return
	}
	err = u.Login()
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't login"})
		return
	}
	// create token
	token, err := utils.GenerateToken(u.Id, u.Email, u.Role)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"Message": "Can't generate token"})
		return
	}

	// save token into cookie
	context.SetCookie("token", token, 7200, "/", "localhost", false, true)

	context.JSON(http.StatusOK, gin.H{"Message": "Login successfully !!", "tokens": token, "role": u.Role})
	// context.JSON(http.StatusOK, gin.H{"Message": "Login successfully !!"})
}

func Register(context *gin.Context) {
	var u models.Account
	err := context.ShouldBindBodyWithJSON(&u)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't read your input information"})
		return
	}
	if u.Role == "customer" {
		err = u.RegisterCustomer()
		if err != nil {
			context.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}
	} else if u.Role == "admin" {
		err = u.RegisterAdmin()
		if err != nil {
			context.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}
	} else if u.Role == "owner" {
		err = u.RegisterOwner()
		if err != nil {
			context.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}
	} else {
		err = u.RegisterStaff()
		if err != nil {
			context.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}
	}
	context.JSON(http.StatusCreated, gin.H{"Message": "Register successfully !!"})
}

func GetAccounts(context *gin.Context) {
	u, _ := models.GetAllAccounts()
	context.JSON(http.StatusOK, gin.H{"users": u})
}

func GetUserProfile(c *gin.Context) {
	role, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"role": role})
}

// LogoutHandler xử lý đăng xuất
func Logout(c *gin.Context) {
	// Xóa cookie bằng cách đặt giá trị rỗng và thời gian hết hạn đã qua
	c.SetCookie("token", "", -1, "/", "localhost", false, true)

	// Trả về phản hồi JSON
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
