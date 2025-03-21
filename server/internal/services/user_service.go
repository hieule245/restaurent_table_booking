package services

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/models"
	"github.com/restaurent_table_booking/internal/utils"
	pkg "github.com/restaurent_table_booking/pkg/email"
)

type PinData struct {
	Pin      int       `json:"pin"`
	ExpireAt time.Time `json:"expire_at"`
	Attempt  int       `json:"attempt"`
}

// Bộ nhớ tạm lưu PIN (dùng sync.Map để thread-safe)
var pinStorage = sync.Map{}

func ResendPin(context *gin.Context) {
	var input struct {
		Email string `json:"email"`
	}

	if err := context.ShouldBindJSON(&input); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	// Kiểm tra xem email có tồn tại không
	_, exists := pinStorage.Load(input.Email)
	if !exists {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Email không hợp lệ hoặc PIN đã hết hạn"})
		return
	}

	// Tạo mã PIN mới
	newPin := pkg.RandomPin()
	fmt.Println("Mã PIN mới được gửi cho:", input.Email)
	pkg.SendMailSimple(input.Email, newPin)

	// Cập nhật bộ nhớ tạm
	newPinData := PinData{
		Pin:      newPin,
		ExpireAt: time.Now().Add(2 * time.Minute),
		Attempt:  0,
	}
	pinStorage.Store(input.Email, newPinData)

	context.JSON(http.StatusOK, gin.H{"message": "Mã PIN mới đã được gửi!"})
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
	c.GetString("role")
	role := c.GetString("role")
	if role == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Can not get role"})
		return
	}
	c.GetInt64("userID")
	userID := c.GetInt64("userID")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Can not get user id"})
		return
	}

	var user models.Account
	user, err := models.GetUserInformationById(userID, role)
	if err != nil {
		// "Can not find user"
		c.JSON(http.StatusUnauthorized, gin.H{"error (get User Profile)": err.Error()})
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// LogoutHandler xử lý đăng xuất
func Logout(c *gin.Context) {
	// Xóa cookie bằng cách đặt giá trị rỗng và thời gian hết hạn đã qua
	c.SetCookie("token", "", -1, "/", "localhost", false, true)

	// Trả về phản hồi JSON
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func Login(context *gin.Context) {
	var u models.Account
	err := context.ShouldBindBodyWithJSON(&u)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't read your input information"})
		return
	}
	err = u.Login()
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	// create token
	token, err := utils.GenerateToken(u.Id, u.Email, u.Role)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"message": "Can't generate token"})
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

	// Kiểm tra trạng thái tài khoản
	if u.Status == "inactive" || u.Status == "ban" {
		context.JSON(http.StatusForbidden, gin.H{"message": "Your account is inactive or banned. You cannot reset your password."})
		return
	}

	// Tạo mã PIN ngẫu nhiên
	pin := pkg.RandomPin()

	pinData := PinData{
		Pin:      pin,
		ExpireAt: time.Now().Add(2 * time.Minute),
		Attempt:  0,
	}
	// Lưu mã PIN vào bộ nhớ tạm (kèm thời gian hết hạn)
	pinStorage.Store(u.Email, pinData)

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
	var acc models.Account

	// Đọc dữ liệu từ request body
	if err := context.ShouldBindJSON(&input); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	// Lấy mã PIN từ bộ nhớ tạm
	value, exists := pinStorage.Load(input.Email)
	if !exists {
		context.JSON(http.StatusBadRequest, gin.H{"message": "PIN expired or email not found"})
		return
	}
	acc.Email = input.Email
	storedPin := value.(PinData)

	_, _ = models.CheckAccount(&acc)

	// Kiểm tra mã PIN nhập vào có đúng không
	if storedPin.Pin != input.Pin {
		storedPin.Attempt++
		remainingAttempts := 5 - storedPin.Attempt
		if storedPin.Attempt >= 5 {
			err := models.SetAccountStatusInactive(input.Email, acc.Role)
			if err != nil {
				context.JSON(http.StatusInternalServerError, gin.H{"message": "Can't change into inactive"})
				return
			}
			pkg.SendMailWarning(input.Email)
			context.JSON(http.StatusForbidden, gin.H{"message": "You have entered the wrong PIN more than 5 times. We blocked you."})
			return
		}

		pinStorage.Store(input.Email, storedPin)
		context.JSON(http.StatusBadRequest, gin.H{
			"message": fmt.Sprintf("Wrong PIN. You have %d attempts left.", remainingAttempts),
		})
		return
	}

	// Xoá mã PIN sau khi kiểm tra thành công (để tránh dùng lại)
	pinStorage.Delete(input.Email)

	context.JSON(http.StatusOK, gin.H{"message": "Check successfully !!"})
}
