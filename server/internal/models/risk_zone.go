package models

type RiskZone struct {
	ID string `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`

	Latitude  float64 `gorm:"not null;index"`
	Longitude float64 `gorm:"not null;index"`

	RiskScore int `gorm:"default:0"`
}
