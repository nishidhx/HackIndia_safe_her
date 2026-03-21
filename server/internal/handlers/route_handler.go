package handlers

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"

	"gorm.io/gorm"
)

type RouteHandler struct {
	db *gorm.DB
}

func NewRouteHandler(db *gorm.DB) *RouteHandler {
	return &RouteHandler{db: db}
}

type RouteRequest struct {
	OriginLat      float64 `json:"origin_lat"`
	OriginLng      float64 `json:"origin_lng"`
	DestinationLat float64 `json:"dest_lat"`
	DestinationLng float64 `json:"dest_lng"`
}

type Coordinate struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// OSRM Response structures
type osrmResponse struct {
	Code   string      `json:"code"`
	Routes []osrmRoute `json:"routes"`
}

type osrmRoute struct {
	Distance float64      `json:"distance"`
	Geometry osrmGeometry `json:"geometry"`
}

type osrmGeometry struct {
	Coordinates [][]float64 `json:"coordinates"` // [longitude, latitude]
	Type        string      `json:"type"`
}

// Returns distance in meters
func haversineDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371e3 // Earth radius
	phi1 := lat1 * math.Pi / 180
	phi2 := lat2 * math.Pi / 180
	deltaPhi := (lat2 - lat1) * math.Pi / 180
	deltaLambda := (lon2 - lon1) * math.Pi / 180

	a := math.Sin(deltaPhi/2)*math.Sin(deltaPhi/2) +
		math.Cos(phi1)*math.Cos(phi2)*
			math.Sin(deltaLambda/2)*math.Sin(deltaLambda/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}

func (h *RouteHandler) GetSafestRoute(w http.ResponseWriter, r *http.Request) {
	var req RouteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if req.OriginLat == 0 || req.DestinationLat == 0 {
		http.Error(w, "Valid origin and destination are required", http.StatusBadRequest)
		return
	}

	// 1. Fetch Alternatives from OSRM
	// Notice longitude goes first in OSRM: {lon},{lat}
	// Passing overview=full prevents the line from being heavily simplified/cutting corners
	url := fmt.Sprintf("http://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?alternatives=true&geometries=geojson&overview=full",
		req.OriginLng, req.OriginLat, req.DestinationLng, req.DestinationLat)

	resp, err := http.Get(url)
	if err != nil || resp.StatusCode != 200 {
		http.Error(w, "Error fetching external routing API", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var externalRoute osrmResponse
	if err := json.NewDecoder(resp.Body).Decode(&externalRoute); err != nil {
		http.Error(w, "Error parsing routing API", http.StatusInternalServerError)
		return
	}

	if len(externalRoute.Routes) == 0 {
		http.Error(w, "No routes found", http.StatusNotFound)
		return
	}

	// 2. Fetch known Incidents for intersections
	var incidents []struct {
		Latitude  float64
		Longitude float64
		Severity  int
	}
	h.db.Table("incidents").Select("latitude", "longitude", "severity").Find(&incidents)

	// 3. Compute Risk Score per Route
	bestRisk := math.MaxInt32
	var bestDist float64 = math.MaxFloat64
	var safestRoute []Coordinate

	for _, rt := range externalRoute.Routes {
		risk := 0

		// Avoid recalculating incident distances for EVERY tiny line segment blindly,
		// but since OSRM returns simplified GeoJSON out of the box, we can just check nodes.
		for _, coord := range rt.Geometry.Coordinates {
			if len(coord) < 2 {
				continue
			}
			lng := coord[0]
			lat := coord[1]

			for _, inc := range incidents {
				dist := haversineDistance(lat, lng, inc.Latitude, inc.Longitude)
				// If route is within 150 meters of an incident, we consider it dangerous
				if dist <= 150 {
					sev := inc.Severity
					if sev <= 0 {
						sev = 1
					}
					risk += sev
				}
			}
		}

		// Choose this route if it has strictly less risk, or if it ties but is shorter
		if risk < bestRisk || (risk == bestRisk && rt.Distance < bestDist) {
			bestRisk = risk
			bestDist = rt.Distance

			var outCoords []Coordinate
			for _, c := range rt.Geometry.Coordinates {
				if len(c) >= 2 {
					outCoords = append(outCoords, Coordinate{Latitude: c[1], Longitude: c[0]})
				}
			}
			safestRoute = outCoords
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":      "success",
		"risk_score":  bestRisk,
		"distance_m":  bestDist,
		"coordinates": safestRoute,
	})
}
