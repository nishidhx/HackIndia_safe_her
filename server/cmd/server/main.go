package main

import (
	"log"
	"net/http"
	"server/internal/database"
	"server/internal/middlewares"
	"server/internal/models"
	"server/internal/routes"
	"server/internal/websocket"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Incoming request: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)

		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	db := database.Connect()

	if db != nil {
		log.Println("DB connected")
	}

	db.AutoMigrate(
		&models.User{},
		&models.EmergencyContact{},
		&models.RiskZone{},
		&models.SOSAlert{},
		&models.Incident{},
	)

	go websocket.ManagerInstance.Run()

	router := routes.SetupRoutes(db)
	// log.Println("Server is running on port: 8080")
	// http.ListenAndServe(":8080", corsMiddleware(router)) // ← only change here

	log.Println("Server is running on port: 8080")

	log.Fatal(http.ListenAndServe(":8080", middlewares.CorsMiddleware(router)))
}
