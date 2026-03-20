package models

import "time"

type SOSAlert struct {
	ID string `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`

	UserID string `gorm:"not null;index"`

	Latitude  float64 `gorm:"not null;index"`
	Longitude float64 `gorm:"not null;index"`

	CreatedAt time.Time `gorm:"autoCreateTime"`

	User User `gorm:"foreignKey:UserID"`
}
