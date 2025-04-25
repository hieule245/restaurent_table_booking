package services

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
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

func Login(context *gin.Context) {
	if _, err := context.Cookie("token"); err == nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	var u models.Account
	if err := context.ShouldBindJSON(&u); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't read your input information"})
		return
	}

	if err := u.Login(); err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	fmt.Println("in4", u.Id, u.Email, u.Role)
	token, err := utils.GenerateToken(u.Id, u.Email, u.Role)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"message": "Can't generate token"})
		return
	}

	// Chỉ set 1 cookie
	context.SetCookie("token", token, 7200, "/", "", false, true)

	context.JSON(http.StatusOK, gin.H{
		"message": "Login successfully !!",
		"token":   token,
		"role":    u.Role,
	})
}

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
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid email or expired PIN."})
		return
	}

	// Tạo mã PIN mới
	newPin := pkg.RandomPin()
	fmt.Println("A new PIN has been sent to:", input.Email)
	pkg.SendMailSimple(input.Email, newPin)

	// Cập nhật bộ nhớ tạm
	newPinData := PinData{
		Pin:      newPin,
		ExpireAt: time.Now().Add(2 * time.Minute),
		Attempt:  0,
	}
	pinStorage.Store(input.Email, newPinData)

	context.JSON(http.StatusOK, gin.H{"message": "New PIN has been sent!"})
}

func ResetPassword(context *gin.Context) {
	var u models.Account
	err := context.ShouldBindBodyWithJSON(&u)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't read your input information"})
		return
	}
	fmt.Println(err)
	err = u.ResetPassword()
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't reset password"})
		return
	}
	fmt.Println(err)
	context.JSON(http.StatusOK, gin.H{"Message": "Reset password successfully !!"})
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

	if user.Role != "admin" {
		err := user.GetAvatar()
		if err != nil {
			// "Can not find user"
			c.JSON(http.StatusUnauthorized, gin.H{"error (get User Profile)": err.Error()})
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{"user": user})
}

// LogoutHandler xử lý đăng xuất
func Logout(c *gin.Context) {
	// Xóa cookie bằng cách đặt giá trị rỗng và thời gian hết hạn đã qua
	c.SetCookie("token", "", -1, "/", "/", false, true)

	// Trả về phản hồi JSON
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func Register(context *gin.Context) {
	var u models.Account
	err := context.ShouldBindBodyWithJSON(&u)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't read your input information"})
		return
	}
	switch u.Role {
	case "customer":
		err = u.RegisterCustomer()
		if err != nil {
			context.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}
	case "admin":
		err = u.RegisterAdmin()
		if err != nil {
			context.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
			return
		}
	case "owner":
		err = u.RegisterOwner()
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

	// 👉 THÊM DÒNG NÀY: kiểm tra thời hạn mã PIN
	if time.Now().After(storedPin.ExpireAt) {
		pinStorage.Delete(input.Pin) // Xoá luôn nếu quá hạn
		fmt.Println("PIN expired for email:", input.Email)
		context.JSON(http.StatusUnauthorized, gin.H{"message": "Your PIN has expired. Please request a new one."})
		return
	}

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

func ChangePassword(context *gin.Context) {
	var pass models.NewPassword
	fmt.Println("Change password")
	err := context.ShouldBindBodyWithJSON(&pass)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid Input"})
		return
	}
	if pass.NewPassword == pass.OldPassword {
		context.JSON(http.StatusBadRequest, gin.H{"message": "New password should not be the same as the old password."})
		return
	}
	var acc models.Account
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
	acc.Email = claims.Gmail
	err = acc.ChangePassword(pass)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	context.JSON(http.StatusOK, gin.H{"message": "Change password succesfully!"})
}

func UpdateProfile(context *gin.Context) {
	var acc models.Account
	var err error
	context.ShouldBindBodyWithJSON(&acc)
	switch acc.Role {
	case "staff":
		err = acc.UpdateStaff()
	case "owner":
		err = acc.UpdateOwner()
	case "customer":
		err = acc.UpdateCustomer()
	case "admin":
		err = acc.UpdateAdmin()
	}

	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
	}
	context.JSON(http.StatusOK, gin.H{"messge": "Update successfully!!"})
}

func UploadImage(context *gin.Context) {
	file, _, err := context.Request.FormFile("file")
	if err != nil {
		fmt.Println("Error getting file 1:", err)
		context.JSON(http.StatusBadRequest, gin.H{"message": "Can't take any image"})
		return
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		fmt.Println("Error getting file 2:", err)
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Can't take any image"})
		return
	}

	// Lấy config Cloudinary từ biến môi trường
	cld, err := cloudinary.NewFromParams(
		os.Getenv("CLOUDINARY_CLOUD_NAME"),
		os.Getenv("CLOUDINARY_API_KEY"),
		os.Getenv("CLOUDINARY_API_SECRET"),
	)
	if err != nil {
		fmt.Println("Error getting file 3:", err)
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Cloudinary setup failed"})
		return
	}

	uploadResult, err := cld.Upload.Upload(context, bytes.NewReader(fileBytes), uploader.UploadParams{
		Folder: "avatars",
	})
	if err != nil {
		fmt.Println("Error uploading file:", err)
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Upload failed", "error": err.Error()})
		return
	}

	imageUrl := uploadResult.SecureURL

	// Lấy thông tin người dùng từ JWT
	token, err := context.Cookie("token")
	if err != nil {
		fmt.Println("Error getting cookie:", err)
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Can not get token from cookie"})
		return
	}

	claims, err := utils.ParseJWT(token)
	if err != nil {
		fmt.Println("Error parsing token:", err)
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Claim failed"})
		return
	}

	var acc models.Account
	acc.Email = claims.Gmail

	// Lưu URL ảnh vào DB
	imageId, err := models.SaveImage(imageUrl)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	if err := models.SaveImageAvatar(imageId, &acc); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{
		"message":  "Upload image successful!",
		"imageUrl": imageUrl,
		"imageId":  imageId,
	})
}
