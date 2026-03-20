package routes

import (
	"server/internal/handlers"
	"server/internal/middlewares"
	"server/internal/websocket"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func SetupRoutes(db *gorm.DB) *mux.Router {
	router := mux.NewRouter()

	authHandler := handlers.NewAuthHandler(db)

	/* Subroutes for auth routes */
	authSubRouter := router.PathPrefix("/auth").Subrouter()
	authSubRouter.Use(middlewares.CheckUserAuthetic)

	/* Subroutes for api routes */
	apiSubRoutes := router.PathPrefix("/api").Subrouter()
	apiSubRoutes.Use(middlewares.CheckUserAuthetic)

	// Register the auth handler for the "/auth" route (example)
	router.HandleFunc("/auth/login", authHandler.SafeHerLogin).Methods("POST", "OPTIONS")
	router.HandleFunc("/auth/register", authHandler.SafeHerRegister).Methods("POST", "OPTIONS")
	// websockets
	router.HandleFunc("/ws/location", websocket.LocationSocket)

	return router
}
