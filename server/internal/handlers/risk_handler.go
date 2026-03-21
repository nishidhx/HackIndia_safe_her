package handlers

import (
	"encoding/json"
	"net/http"
	"server/internal/ai"
	"server/internal/middlewares"
	"server/pkg/jwt"
	"server/services"

	"gorm.io/gorm"
)

type RiskHandler struct {
	service *services.RiskService
	db      *gorm.DB
}

func NewRiskHandler(db *gorm.DB) *RiskHandler {
	// Ideally load from config/env
	apiKey := "c9hBn8wUJN1Ad0rLQu07PxzwYzEtCKrLMMDMV0aj"

	aiClient := ai.NewCohereClient(apiKey)
	riskService := services.NewRiskService(aiClient)

	return &RiskHandler{
		service: riskService,
		db:      db,
	}
}

type RiskRequest struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Context   string  `json:"context"`
}

func (h *RiskHandler) GetRiskScore(w http.ResponseWriter, r *http.Request) {
	var req RiskRequest
	json.NewDecoder(r.Body).Decode(&req)

	if req.Latitude == 0 && req.Longitude == 0 {
		http.Error(w, "Valid latitude and longitude required", http.StatusBadRequest)
		return
	}

	var incidents []struct {
		Latitude  float64
		Longitude float64
		Severity  int
	}
	if err := h.db.Table("incidents").Select("latitude", "longitude", "severity").Find(&incidents).Error; err != nil {
		http.Error(w, "Failed to retrieve incidents", http.StatusInternalServerError)
		return
	}

	riskScore := 0
	incidentCount := 0

	for _, inc := range incidents {
		dist := haversineDistance(req.Latitude, req.Longitude, inc.Latitude, inc.Longitude)
		if dist <= 5000 { // within 5km
			incidentCount++
			sev := inc.Severity
			if sev <= 0 { sev = 1 }
			if dist <= 1000 { // within 1km
				riskScore += sev * 15
			} else {
				riskScore += sev * 5
			}
		}
	}

	if riskScore > 100 {
		riskScore = 100
	}

	level := "Low"
	if riskScore > 30 {
		level = "Moderate"
	}
	if riskScore > 70 {
		level = "High"
	}
	if riskScore > 90 {
		level = "Critical"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"score":          riskScore,
		"level":          level,
		"incident_count": incidentCount,
	})
}

func (h *RiskHandler) GetRiskExplanation(w http.ResponseWriter, r *http.Request) {
	var req RiskRequest
	json.NewDecoder(r.Body).Decode(&req)

	input := req.Context
	if input == "" {
		input = "Location with repeated safety incidents at night"
	}

	explanation, err := h.service.GetRiskExplanation(input)
	if err != nil {
		http.Error(w, "Failed to generate explanation", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"explanation": explanation,
	})
}

func (h *RiskHandler) GetRiskMessage(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Question string `json:"question"`
	}

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Question == "" {
		http.Error(w, "Question is required", http.StatusBadRequest)
		return
	}

	// Call service (which internally calls Cohere)
	response, err := h.service.GetRiskExplanation(req.Question)
	if err != nil {
		http.Error(w, "Failed to get AI response", http.StatusInternalServerError)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": response,
	})
}

func (h *RiskHandler) AddRiskZone(w http.ResponseWriter, r *http.Request) {
	// Import models inline-style or expect goimports to fix it if running an IDE.
	// We'll decode a RiskRequest structurally and move it to models below
	var req RiskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if req.Latitude == 0 && req.Longitude == 0 {
		http.Error(w, "Valid Latitude and Longitude are required", http.StatusBadRequest)
		return
	}

	// We create a map to avoid importing models due to possible circular dependency or missing import
	// Let's rely on gorm maps or struct if models is accessible. I will just create a struct for it.
	zone := map[string]interface{}{
		"latitude":  req.Latitude,
		"longitude": req.Longitude,
	}

	if err := h.db.Table("risk_zones").Create(&zone).Error; err != nil {
		http.Error(w, "Failed to store risk zone in DB", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Risk zone added",
	})
}

type IncidentRequest struct {
	UserID      string  `json:"user_id"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Type        string  `json:"type"`
	Description string  `json:"description"`
	Severity    int     `json:"severity"`
}

func (h *RiskHandler) AddIncident(w http.ResponseWriter, r *http.Request) {
	var req IncidentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	claims, ok := r.Context().Value(middlewares.UserClaimsKey).(*jwt.TokenPayload)
	if !ok || claims == nil {
		http.Error(w, "Unauthorized: missing valid token claims", http.StatusUnauthorized)
		return
	}
	userId := claims.UserID

	incident := map[string]interface{}{
		"user_id":     userId,
		"latitude":    req.Latitude,
		"longitude":   req.Longitude,
		"type":        req.Type,
		"description": req.Description,
		"severity":    req.Severity,
	}

	if err := h.db.Table("incidents").Create(&incident).Error; err != nil {
		http.Error(w, "Failed to store incident in DB", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Incident reported",
	})
}
