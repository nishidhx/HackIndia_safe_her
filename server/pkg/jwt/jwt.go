package jwt

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	tokenExpiry = 24 * time.Hour
	issuer      = "aurenith.team"
)

// tokenPayload holds the claims for the jwt token
type TokenPayload struct {
	UserID           string   `json:"user_id"`
	Username         string   `json:"username"`
	Email            string   `json:"email"`
	EmergencyContact []string `json:"emergency_contact"`
	jwt.RegisteredClaims
}

type TokenService struct {
	secretKey []byte
}

func NewTokenService(secretKey string) (*TokenService, error) {
	if secretKey == "" {
		return nil, errors.New("secret key cannot be empty")
	}
	return &TokenService{secretKey: []byte(secretKey)}, nil
}

func (t *TokenService) GenerateUserAuthenticationToken(paylod TokenPayload) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour) // token validity for 24 hrs.
	issuedAtTime := time.Now()

	paylodClaims := &TokenPayload{
		UserID:           paylod.UserID,
		Username:         paylod.Username,
		Email:            paylod.Email,
		EmergencyContact: paylod.EmergencyContact,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			Issuer:    "aurenith.team",
			IssuedAt:  jwt.NewNumericDate(issuedAtTime),
			Subject:   paylod.UserID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, paylodClaims)

	tokenString, err := token.SignedString([]byte(t.secretKey))

	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (t *TokenService) ValidateUserAuthicationToken(tokenString string) (*TokenPayload, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&TokenPayload{},
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return t.secretKey, nil
		})

	if err != nil {
		return nil, err
	}

	tokenPayloadClaims, ok := token.Claims.(*TokenPayload)
	if !ok || !token.Valid {
		return nil, errors.New("Invalid Token")
	}

	return tokenPayloadClaims, nil
}

func getTokenService() (*TokenService, error) {
	return NewTokenService("SAFE_HER_SECRET")
}
