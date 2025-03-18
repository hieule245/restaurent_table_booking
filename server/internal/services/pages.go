package services

import (
	"github.com/gin-gonic/gin"
)

func Home(context *gin.Context) {
	context.JSON(200, gin.H{
		"message": "Welcome to Restaurant Table Booking",
	})
}
