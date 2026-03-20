package handlers

import (
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

func (I *IncidentHandler) reportSafeHerIncident(writer http.ResponseWriter, request http.Request) {

}
