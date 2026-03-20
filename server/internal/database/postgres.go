package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() *gorm.DB {

	database_url := os.Getenv("DB_URL")

	log.Printf("DB_URL: %v", database_url)

	var dsn string

	if database_url != "" {
		dsn = database_url
	} else {
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode-disabled",
			os.Getenv("DB_HOST"),
			os.Getenv("DB_USER"),
			os.Getenv("DB_PASS"),
			os.Getenv("DB_NAME"),
			os.Getenv("DB_PORT"),
		)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Failed to setup connection with database: ", err)
	}

	fmt.Println("Connected to PostgresSQL with GORM")

	DB = db

	return DB
}
