package models

/*
EmergencyContact schema
-> contains the id of the contact
-> id of the user mapped with this emergency contact
-> name of the emergency contact
-> phone number of emergency contact
*/

type EmergencyContact struct {
	ID string `gorm:"type:uuid;default:uuid_generate_v4();primaryKey"`

	UserID string `gorm:"not null;index"`

	Name        string `gorm:"not null"`
	PhoneNumber string `gorm:"unique;not null;index"`

	User User `gorm:"foreignKey:UserID"`
}
