package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/utils"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Can not get token from cookie"})
			c.Abort()
			return
		}
		claims, err := utils.ParseJWT(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Claim failse"})
			c.Abort()
			return
		}

		// Lưu userID và role vào context để sử dụng trong handler
		c.Set("userID", claims.UserID)
		c.Set("role", claims.Role)

		c.Next()
	}
}

func AdminOnly(c *gin.Context) {
	role, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusForbidden, gin.H{"error": "No role found"})
		c.Abort()
		return
	}

	roleStr, ok := role.(string) // Ép kiểu về string
	if !ok || roleStr != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin Access denied"})
		c.Abort()
		return
	}

	c.Next() // Tiếp tục request nếu là admin
}

func OwnerOnly(c *gin.Context) {
	role, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusForbidden, gin.H{"error": "No role found"})
		c.Abort()
		return
	}

	roleStr, ok := role.(string)
	if !ok || roleStr != "owner" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Owner Access denied"})
		c.Abort()
		return
	}

	c.Next() // Tiếp tục request nếu là owner
}

func StaffOnly(c *gin.Context) {
	role, exists := c.Get("role")
	if !exists {
		c.JSON(http.StatusForbidden, gin.H{"error": "No role found"})
		c.Abort()
		return
	}

	roleStr, ok := role.(string)
	if !ok || roleStr != "staff" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Staff Access denied"})
		c.Abort()
		return
	}

	c.Next() // Tiếp tục request nếu là staff
}
