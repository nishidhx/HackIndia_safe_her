package middlewares

import (
	"context"
	"log"
	"net/http"
	"server/pkg/jwt"
)

type contextKey string

const UserClaimsKey contextKey = "userClaims"

func CheckUserAuthetic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		log.Printf("Incoming request: %s %s from %s", request.Method, request.URL.Path, request.RemoteAddr)

		session_token, err := request.Cookie("session_token")

		if err != nil {
			if err == http.ErrNoCookie {
				log.Println("Token not found")
				http.Error(writer, "no session_token found in the cookie user not authorized", http.StatusUnauthorized)
				return
			}
			http.Error(writer, "bad request", http.StatusBadRequest)
			log.Printf("Error reading cookies: %v", err)
			return
		}

		tokenService, err := jwt.NewTokenService("SAFE_HER_SECRET")
		if err != nil {
			http.Error(writer, "internal server error", http.StatusInternalServerError)
			return
		}

		tokenPayloadClaims, err := tokenService.ValidateUserAuthicationToken(session_token.Value)

		if err != nil {
			log.Printf("something went wrong invalid token found: %v", err)
			http.Error(writer, "invalid token", http.StatusUnauthorized)
			return
		}

		// settings a context for the new request body
		new_request_ctx := context.WithValue(request.Context(), UserClaimsKey, tokenPayloadClaims)

		// => creating a new request body with new context
		request = request.WithContext(new_request_ctx)

		next.ServeHTTP(writer, request)
	})
}
