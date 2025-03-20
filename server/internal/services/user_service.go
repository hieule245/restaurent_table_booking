package services

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/models"
	"github.com/restaurent_table_booking/internal/utils"
	pkg "github.com/restaurent_table_booking/pkg/email"
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

// Bộ nhớ tạm lưu PIN (dùng sync.Map để thread-safe)
var pinStorage = sync.Map{}

func ForgotPassword(context *gin.Context) {
	var u models.Account

	// Đọc thông tin từ request body
	if err := context.ShouldBindJSON(&u); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't read your input information"})
		return
	}

	// Kiểm tra tài khoản có tồn tại không
	_, exists := models.CheckAccount(&u)
	if exists {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Don't have any account like this"})
		return
	}

	// Tạo mã PIN ngẫu nhiên
	pin := pkg.RandomPin()

	// Lưu mã PIN vào bộ nhớ tạm (kèm thời gian hết hạn)
	pinStorage.Store(u.Email, pin)

	// Gửi mã PIN qua email
	pkg.SendMailSimple(u.Email, pin)

	context.JSON(http.StatusOK, gin.H{"message": "Send mail successfully !!"})
}

// Check mã PIN
func CheckPin(context *gin.Context) {
	type PinInput struct {
		Email string `json:"email"`
		Pin   int    `json:"pin"`
	}

	var input PinInput

	// Đọc dữ liệu từ request body
	if err := context.ShouldBindJSON(&input); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	// Lấy mã PIN từ bộ nhớ tạm
	storedPin, exists := pinStorage.Load(input.Email)
	if !exists {
		context.JSON(http.StatusBadRequest, gin.H{"message": "PIN expired or email not found"})
		return
	}

	// Kiểm tra mã PIN nhập vào có đúng không
	if storedPin.(int) != input.Pin {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Wrong PIN"})
		return
	}

	// Xoá mã PIN sau khi kiểm tra thành công (để tránh dùng lại)
	pinStorage.Delete(input.Email)

	context.JSON(http.StatusOK, gin.H{"message": "Check successfully !!"})
}

func ResetPassword(context *gin.Context) {
	var u models.Account
	err := context.ShouldBindBodyWithJSON(&u)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't read your input information"})
		return
	}
	err = u.ResetPassword()
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't reset password"})
		return
	}
	context.JSON(http.StatusOK, gin.H{"Message": "Reset password successfully !!"})
}

func GetAllAccounts(context *gin.Context) {
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
