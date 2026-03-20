package models

import "time"

/*
User Schema
-> Contains basic user information
-> One user can have multiple emergency contacts
-> One user can report incidents
-> One user can create multiple SOS alerts
*/

type User struct {
	ID          string    `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`
	Name        string    `gorm:"not null"`
	Email       string    `gorm:"unique;not null"`
	PhoneNumber string    `gorm:"unique;not null"`
	Password    string    `gorm:"not null"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`

	EmergencyContacts []EmergencyContact `gorm:"foreignKey:UserID"`
	SOSAlerts         []SOSAlert         `gorm:"foreignKey:UserID"`
	Incidents         []Incident         `gorm:"foreignKey:UserID"`
}
