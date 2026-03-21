// package routes

// import (
// 	"server/internal/handlers"
// 	"server/internal/websocket"

// 	"github.com/gorilla/mux"
// 	"gorm.io/gorm"
// )

// func SetupRoutes(db *gorm.DB) *mux.Router {
// 	router := mux.NewRouter()

// 	authHandler := handlers.NewAuthHandler(db)

// 	/* Subroutes for auth routes */
// 	// authSubRouter := router.PathPrefix("/auth").Subrouter()
// 	// authSubRouter.Use(middlewares.CheckUserAuthetic)

// 	/* Subroutes for api routes */
// 	// apiSubRoutes := router.PathPrefix("/api").Subrouter()
// 	// apiSubRoutes.Use(middlewares.CheckUserAuthetic)

// 	// Register the auth handler for the "/auth" route (example)
// 	router.HandleFunc("/auth/login", authHandler.SafeHerLogin).Methods("POST", "OPTIONS")
// 	router.HandleFunc("/auth/register", authHandler.SafeHerRegister).Methods("POST", "OPTIONS")
// 	// websockets
// 	router.HandleFunc("/ws/location", websocket.LocationSocket)

// 	return router
// }

package routes

import (
	"net/http"
	"server/internal/handlers"
	"server/internal/middlewares"
	"server/internal/websocket"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// func SetupRoutes(db *gorm.DB) *mux.Router {
// 	router := mux.NewRouter()

// 	// Handlers
// 	authHandler := handlers.NewAuthHandler(db)
// 	riskHandler := handlers.NewRiskHandler(db)

// 	// =========================
// 	// Auth Routes
// 	// =========================
// 	authRouter := router.PathPrefix("/auth").Subrouter()

// 	authRouter.HandleFunc("/login", authHandler.SafeHerLogin).Methods("POST", "OPTIONS")
// 	authRouter.HandleFunc("/register", authHandler.SafeHerRegister).Methods("POST", "OPTIONS")

// 	// =========================
// 	// API Routes
// 	// =========================
// 	apiRouter := router.PathPrefix("/api").Subrouter()

// 	apiRouter.HandleFunc("/risk/score", riskHandler.GetRiskScore).Methods("POST")
// 	apiRouter.HandleFunc("/risk/explain", riskHandler.GetRiskExplanation).Methods("POST")

// 	// =========================
// 	// WebSocket
// 	// =========================
// 	router.HandleFunc("/ws/location", websocket.LocationSocket)

// 	return router
// }

func SetupRoutes(db *gorm.DB) *mux.Router {
	router := mux.NewRouter()

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db)
	riskHandler := handlers.NewRiskHandler(db)
	routeHandler := handlers.NewRouteHandler(db)

	// =========================
	// Auth Routes
	// =========================
	authRouter := router.PathPrefix("/auth").Subrouter()

	authRouter.HandleFunc("/login", authHandler.SafeHerLogin).Methods(http.MethodPost, http.MethodOptions)
	authRouter.HandleFunc("/register", authHandler.SafeHerRegister).Methods(http.MethodPost, http.MethodOptions)

	// =========================
	// API Routes
	// =========================
	apiRouter := router.PathPrefix("/api").Subrouter()

	// Protect with auth middleware
	apiRouter.Use(middlewares.CheckUserAuthetic)

	// Risk routes
	apiRouter.HandleFunc("/risk/score", riskHandler.GetRiskScore).Methods(http.MethodPost, http.MethodOptions)
	apiRouter.HandleFunc("/risk/explain", riskHandler.GetRiskExplanation).Methods(http.MethodPost, http.MethodOptions)

	// Chat / AI assistant (NEW)
	apiRouter.HandleFunc("/risk/chat", riskHandler.GetRiskMessage).Methods(http.MethodPost, http.MethodOptions)

	// Save Risk Zone
	apiRouter.HandleFunc("/risk/zone", riskHandler.AddRiskZone).Methods(http.MethodPost, http.MethodOptions)

	// Save Incident
	apiRouter.HandleFunc("/risk/incident", riskHandler.AddIncident).Methods(http.MethodPost, http.MethodOptions)

	// Get Safest Route
	apiRouter.HandleFunc("/risk/route", routeHandler.GetSafestRoute).Methods(http.MethodPost, http.MethodOptions)

	// =========================
	// WebSocket
	// =========================
	router.HandleFunc("/ws/location", websocket.LocationSocket)

	return router
}
