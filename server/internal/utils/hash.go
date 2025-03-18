package utils

import "golang.org/x/crypto/bcrypt"

func HashPassword(password string) (string, error) {
	hashPassword, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(hashPassword), err
}

func PasswordVerify(password, hashedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}
