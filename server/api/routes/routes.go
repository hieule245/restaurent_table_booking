package routes

import (
	"github.com/gin-gonic/gin"
)

func Routes(server *gin.Engine) {
	// Authentication routes
	AuthRoutes(server)

	// Users routes (View - Add - Edit - Delete)
	AdminRoutes(server) // Các route yêu cầu quyền Admin
	OwnerRoutes(server)
	CustomerRoutes(server)

}
