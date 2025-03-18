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
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
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
	if !exists || role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		c.Abort() // Dừng request nếu không có quyền admin
		return
	}

	c.Next() // Tiếp tục xử lý nếu là admin
}
