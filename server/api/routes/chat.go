package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/services"
)

func RegisterChatRoutes(r *gin.Engine) {
	chat := r.Group("/api/chat")
	{
		chat.GET("/people", services.GetChatPeople)
	}
}
