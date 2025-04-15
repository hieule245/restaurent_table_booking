package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/db"
)

func RegisterStatusRoutes(router *gin.Engine) {
	router.GET("/status", func(c *gin.Context) {
		if db.IsDBConnected {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		} else {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "fail", "message": "Cannot connect to database"})
		}
	})
}
