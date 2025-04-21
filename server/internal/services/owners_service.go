package services

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
	"github.com/restaurent_table_booking/internal/models"
	"github.com/restaurent_table_booking/internal/utils"
)

// RESTAURANT HANDLER
func GetAllRestaurants(context *gin.Context) {
	restaurants, err := models.GetAllRestaurants()
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"restaurants": restaurants})
}

func GetAllOwnerRestaurants(context *gin.Context) {
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
	acc.Id = claims.UserID

	err, restaurant := models.GetRestaurantByOwnerID(acc.Id)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Can't collect data"})
		context.Abort()
		return
	}
	context.JSON(http.StatusOK, gin.H{"Owner restaurants": restaurant})
}

func GetRestaurantByID(context *gin.Context) {
	restaurantID := context.Param("restaurant_id") // Lấy ID từ URL
	restaurant, err := models.GetRestaurantByID(restaurantID)
	if err != nil {
		context.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"restaurant": restaurant})
}

func CreateRestaurant(context *gin.Context) {
	var r models.Restaurant
	err := context.ShouldBindBodyWithJSON(&r)
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
	r.Owner_id = claims.UserID
	if err != nil {
		context.JSON(http.StatusBadGateway, gin.H{"message": "Can't take any input information"})
		return
	}
	err = r.CreateRestaurant()
	if err != nil {
		context.JSON(http.StatusBadGateway, gin.H{"message": err.Error()})
		return
	}
	context.JSON(http.StatusOK, gin.H{"message": "Create succesfully", "restaurant": r})
}

func EditRestaurant(context *gin.Context) {
	restaurantIDStr := context.Param("restaurant_id") // Lấy ID từ URL

	// Chuyển đổi restaurantID từ string -> int64
	restaurantID, err := strconv.ParseInt(restaurantIDStr, 10, 64)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid restaurant ID"})
		return
	}

	var updatedRestaurant models.Restaurant
	if err := context.ShouldBindJSON(&updatedRestaurant); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request body"})
		return
	}

	updatedRestaurant.Id = restaurantID // Gán ID đã convert cho model
	err = updatedRestaurant.UpdateRestaurant()
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to update restaurant", "error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Restaurant updated successfully", "restaurant": updatedRestaurant})
}

func DeleteRestaurant(context *gin.Context) {
	restaurantIDStr := context.Param("restaurant_id") // Lấy ID từ URL

	// 🔥 Chuyển đổi restaurantID từ string -> int64
	restaurantID, err := strconv.ParseInt(restaurantIDStr, 10, 64)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"message": "Invalid restaurant ID"})
		return
	}

	// Gọi hàm xóa nhà hàng trong models
	err = models.DeleteRestaurantByID(restaurantID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to delete restaurant", "error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Restaurant deleted successfully"})
}

// TABLE HANDLER
func GetAllTables(context *gin.Context) {
	restaurantID, err := strconv.Atoi(context.Param("restaurant_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid restaurant ID"})
		return
	}

	tables, err := models.GetAllTables(restaurantID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"tables": tables})
}

func GetTableByID(context *gin.Context) {
	tableID, err := strconv.Atoi(context.Param("table_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid table ID"})
		return
	}

	table, err := models.GetTableByID(tableID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch table"})
		return
	}
	if table.ID == 0 {
		context.JSON(http.StatusNotFound, gin.H{"error": "Table not found"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"table": table})
}

func UploadImageTables(context *gin.Context) {
	file, _, err := context.Request.FormFile("imageTable")
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
		Folder: "tables",
	})
	if err != nil {
		fmt.Println("Error uploading file:", err)
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Upload failed", "error": err.Error()})
		return
	}

	imageUrl := uploadResult.SecureURL

	// Lưu URL ảnh vào DB
	imageId, err := models.SaveImage(imageUrl)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"message": "Error saving image to database", "error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{
		"message":  "Upload image successful!",
		"imageUrl": imageUrl,
		"imageId":  imageId,
	})
}

func CreateTable(context *gin.Context) {
	restaurantID, err := strconv.Atoi(context.Param("restaurant_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid restaurant ID"})
		return
	}

	var table models.Table
	if err := context.ShouldBindBodyWithJSON(&table); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	table.RestaurantID = restaurantID
	fmt.Println("table", table)
	if err := table.CreateTable(); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.JSON(http.StatusCreated, gin.H{"message": "Table created", "table": table})
}

func EditTable(context *gin.Context) {
	tableID, err := strconv.Atoi(context.Param("table_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid table ID"})
		return
	}
	var table models.Table
	err = context.ShouldBindBodyWithJSON(&table)
	fmt.Println("table -2", table)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}

	table.ID = tableID

	if err := table.UpdateTable(); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update table"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Table updated", "table": table})
}

func DeleteTable(context *gin.Context) {
	tableID, err := strconv.Atoi(context.Param("table_id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid table ID"})
		return
	}

	if err := models.DeleteTable(tableID); err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete table"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Table deleted"})
}

func GetAllReservations(context *gin.Context) {
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
	user_id := claims.UserID
	reservation, err := models.GetBookingByOwner(user_id)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		context.Abort()
		return
	}
	context.JSON(http.StatusOK, gin.H{"booking": reservation})
}

func GetReservationsByRestaurants(context *gin.Context) {
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
	user_id := claims.UserID
	var restaurant_id int
	restaurant_id, err = strconv.Atoi(context.Param("restaurant_id"))
	reservation, err := models.GetBookingByRestaurantId(claims.Gmail, user_id, restaurant_id)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		context.Abort()
		return
	}
	context.JSON(http.StatusOK, gin.H{"booking": reservation})
}

func EndingUsingTable(context *gin.Context) {
	var res *models.Booking
	err := context.ShouldBindBodyWithJSON(&res)
	if err != nil {
		fmt.Println("1", err)
		context.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	res.ActualEnd = time.Now().Format("15:04")

	fmt.Println("res.ActualEnd", res.ActualEnd)

	if res.Status == 4 {
		err = res.EditCheckout()
		if err != nil {
			fmt.Println("3", err)
			context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}
	}

	err = res.Checkout()
	if err != nil {
		fmt.Println("2", err)
		context.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	context.JSON(http.StatusOK, gin.H{"message": "Update successfully !!!"})
}

func percentChange(current, last interface{}) interface{} {
	switch cur := current.(type) {
	case float32:
		las := last.(float32)
		if las == 0 {
			if cur == 0 {
				return float32(0)
			}
			return float32(100)
		} else {
			if cur == 0 {
				return float32(-100)
			}
		}
		return ((cur - las) / las) * 100

	case int:
		las := last.(int)
		if las == 0 {
			if cur == 0 {
				return 0
			}
			return 100
		}
		if cur == 0 {
			return -100
		}
		return ((cur - las) * 100) / las

	default:
		return nil // unsupported type
	}
}

func StaticRevenue(context *gin.Context) {
	token, err := context.Cookie("token")
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Can not get token from cookie"})
		context.Abort()
		return
	}
	claims, err := utils.ParseJWT(token)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		context.Abort()
		return
	}

	curRev := &models.Revenues{}
	err = curRev.GetCurrentWeekRevenue(claims.UserID)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("1 revenues- %s", err.Error())})
		context.Abort()
		return
	}

	LastRev := &models.Revenues{}
	err = LastRev.GetLastRevenue(claims.UserID)
	fmt.Println("curRev", LastRev)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("2 revenues- %s", err.Error())})
		context.Abort()
		return
	}

	curRev.DiffTotal = percentChange(curRev.WeeklyRevenue, LastRev.WeeklyRevenue).(float32)
	curRev.DiffBookNumber = percentChange(curRev.BookNumber, LastRev.BookNumber).(int)
	curRev.DiffCanceledBook = percentChange(curRev.CanceledBook, LastRev.CanceledBook).(int)

	fmt.Println("diff", curRev.DiffTotal, curRev.DiffBookNumber, curRev.DiffCanceledBook)
	context.JSON(http.StatusOK, gin.H{"message": curRev})
}

func GetNumberBookingEachRole(context *gin.Context) {
	token, err := context.Cookie("token")
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Can not get token from cookie"})
		context.Abort()
		return
	}
	claims, err := utils.ParseJWT(token)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		context.Abort()
		return
	}
	numCustomer, numStaff, err := models.GetNumberBookingEachRole(claims.UserID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		context.Abort()
		return
	}
	context.JSON(http.StatusOK, gin.H{"numCustomer": numCustomer, "numStaff": numStaff})
}

func GetTopRestaurantRevenues(context *gin.Context) {
	token, err := context.Cookie("token")
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": "Can not get token from cookie"})
		context.Abort()
		return
	}
	claims, err := utils.ParseJWT(token)
	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		context.Abort()
		return
	}
	var top []models.TopRestaurant
	top, err = models.GetTopRestaurantRevenues(claims.UserID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		context.Abort()
		return
	}
	context.JSON(http.StatusOK, gin.H{"top": top})
}
