package handlers

import (
	"encoding/json"
	"net/http"
	"server/internal/ai"
	"server/services"

	"gorm.io/gorm"
)

type RiskHandler struct {
	service *services.RiskService
}

func NewRiskHandler(db *gorm.DB) *RiskHandler {
	// Ideally load from config/env
	apiKey := "c9hBn8wUJN1Ad0rLQu07PxzwYzEtCKrLMMDMV0aj"

	aiClient := ai.NewCohereClient(apiKey)
	riskService := services.NewRiskService(aiClient)

	return &RiskHandler{
		service: riskService,
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

	score := h.service.GetRiskScore(req.Latitude, req.Longitude)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"risk_score": score,
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
