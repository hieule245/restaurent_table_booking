package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt"
)

var secretKey = "secretKey"

type Claims struct {
	UserID int64  `json:"userId"`
	Gmail  string `json:"gmail"`
	Role   string `json:"role"`
	jwt.StandardClaims
}

// GenerateToken tạo JWT cho người dùng
func GenerateToken(userId int64, gmail, role string) (string, error) {
	claims := Claims{
		UserID: userId,
		Gmail:  gmail,
		Role:   role,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(2 * time.Hour).Unix(), // Token hết hạn sau 2 giờ
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secretKey))
}

// ParseJWT trích xuất thông tin user từ token
func ParseJWT(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, errors.New("invalid token")
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("can not parse token")
}