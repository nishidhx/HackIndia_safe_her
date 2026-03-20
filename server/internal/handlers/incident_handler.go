package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"gorm.io/gorm"
)

type IncidentHandler struct {
	DB *gorm.DB
}

func NewIncidentHandler(db *gorm.DB) *IncidentHandler {
	return &IncidentHandler{
		DB: db,
	}
}

func (h *IncidentHandler) ReportSafeHerIncident(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Latitude    float64 `json:"latitude"`
		Longitude   float64 `json:"longitude"`
		Type        string  `json:"type"`
		Description string  `json:"description"`
		Severity    int     `json:"severity"`
	}

	// Decode request body
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		log.Println("Invalid request body:", err)
		return
	}

	// Validation
	if req.Type == "" || req.Description == "" {
		http.Error(w, "Type and Description are required", http.StatusBadRequest)
		return
	}

	if req.Severity < 1 || req.Severity > 5 {
		http.Error(w, "Severity must be between 1 and 5", http.StatusBadRequest)
		return
	}

	// Create incident model
	incident := map[string]interface{}{
		"latitude":    req.Latitude,
		"longitude":   req.Longitude,
		"type":        req.Type,
		"description": req.Description,
		"severity":    req.Severity,
	}

	// Save to database
	if err := h.DB.Table("incidents").Create(&incident).Error; err != nil {
		http.Error(w, "Failed to save incident", http.StatusInternalServerError)
		log.Println("DB error:", err)
		return
	}

	log.Printf("Incident reported: %+v\n", req)

	// Response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Incident reported successfully",
		"data":    incident,
	})
}
