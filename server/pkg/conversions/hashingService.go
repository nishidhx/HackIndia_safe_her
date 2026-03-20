package conversions

import (
	"log"

	"golang.org/x/crypto/bcrypt"
)

func HashingService(password string) string {

	var userPass string = password

	/* Hashing the password */
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userPass), bcrypt.DefaultCost)

	if err != nil {
		log.Println("hashing password failed: ", err)
	}

	return string(hashedPassword)
}

func ComparehashPassword(password string, hashedPassword string) bool {

	var userPass string = password
	isPasswordMatched := false
	/* comparing if the password is correct or not */
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(userPass))

	if err != nil {
		log.Println("password not matched")
		return false
	} else {
		log.Println("password matches")
		isPasswordMatched = true
	}

	return isPasswordMatched
}

func comparePasses(password string, hashedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
