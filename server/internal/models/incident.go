package models

import "time"

type Incident struct {
	ID string `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`

	UserID string `gorm:"not null;index"`

	Latitude  float64 `gorm:"not null;index"`
	Longitude float64 `gorm:"not null;index"`

	Type        string
	Description string
	Severity    int

	CreatedAt time.Time `gorm:"autoCreateTime"`

	User User `gorm:"foreignKey:UserID"`
}
