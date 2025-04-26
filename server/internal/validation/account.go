package validation

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/restaurent_table_booking/internal/models"
)

var Validate *validator.Validate

func init() {
	Validate = validator.New()

	// Custom validator: fullnameregex
	Validate.RegisterValidation("fullnameregex", func(fl validator.FieldLevel) bool {
		reg := regexp.MustCompile(`^[\p{L}\s'.-]+$`) // Ví dụ regex cho tên đầy đủ
		return reg.MatchString(fl.Field().String())
	})

	// Custom validator: emailregex
	Validate.RegisterValidation("emailregex", func(fl validator.FieldLevel) bool {
		reg := regexp.MustCompile(`^[\w\.-]+@[\w\.-]+\.\w+$`)
		return reg.MatchString(fl.Field().String())
	})

	// Custom validator: phoneregex
	Validate.RegisterValidation("phoneregex", func(fl validator.FieldLevel) bool {
		reg := regexp.MustCompile(`^0\d{9,10}$`) // VD: số điện thoại VN
		return reg.MatchString(fl.Field().String())
	})

	// Custom validator: passwordregex
	Validate.RegisterValidation("passwordregex", func(fl validator.FieldLevel) bool {
		password := fl.Field().String()
		// Độ dài kiểm tra trước
		if len(password) < 8 || len(password) > 64 {
			return false
		}
		// Các điều kiện riêng
		hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
		hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
		hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
		hasSpecial := regexp.MustCompile(`[!@#\$%\^&\*]`).MatchString(password)
		onlyValidChars := regexp.MustCompile(`^[a-zA-Z0-9!@#\$%\^&\*]+$`).MatchString(password)

		return hasLower && hasUpper && hasNumber && hasSpecial && onlyValidChars
	})

}

func ValidateInput(ctx *gin.Context, data interface{}, screen string, skipFields map[string]bool, checkPasswordMatch bool) bool {
	err := Validate.Struct(data)
	errorMap := make(map[string]string)

	if err != nil {
		if errs, ok := err.(validator.ValidationErrors); ok {
			for _, e := range errs {
				field := strings.ToLower(e.Field())
				if skipFields != nil && skipFields[field] {
					continue
				}
				switch e.Tag() {
				case "required":
					errorMap[field] = field + " is required"
				case "email":
					errorMap[field] = "Invalid email format"
				case "min":
					errorMap[field] = field + " must be at least " + e.Param() + " characters"
				case "max":
					errorMap[field] = field + " must be at most " + e.Param() + " characters"
				case "emailregex":
					errorMap[field] = "Email format is not accepted"
				case "passwordregex":
					errorMap[field] = "Password must be 8-64 characters and include only letters, numbers, or special characters (!@#$%^&*)"
				case "phoneregex":
					if screen == "register" {
						errorMap[field] = "Invalid phone number"
					}
				default:
					errorMap[field] = "Invalid " + field
				}
			}
		}
	}

	// Custom check: ConfirmPassword == Password (nếu cần)
	if checkPasswordMatch {
		// ép kiểu về struct có Password và ConfirmPassword
		if account, ok := data.(*models.Account); ok {
			if account.Password != account.ConfirmPassword {
				errorMap["confirmPassword"] = "Passwords do not match"
			}
		}
	}

	fmt.Println("error", errorMap)

	if len(errorMap) > 0 {
		ctx.JSON(400, gin.H{"errors": errorMap})
		return false
	}

	return true
}

func ValidateAccountInput(ctx *gin.Context, u *models.Account, screen string) bool {
	var skipFields map[string]bool
	if screen == "login" {
		skipFields = map[string]bool{
			"name":            true,
			"phone":           true,
			"confirmpassword": true,
		}
	} else if screen == "information" {
		skipFields = map[string]bool{
			"password":        true,
			"email":           true,
			"confirmpassword": true,
		}
	}
	return ValidateInput(ctx, u, screen, skipFields, screen != "login")
}

func ValidateChangePassInput(ctx *gin.Context, u *models.NewPassword, screen string) bool {
	return ValidateInput(ctx, u, screen, nil, false)
}
