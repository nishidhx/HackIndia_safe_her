package websocket

type LocationMessage struct {
	UserId string  `json:"user_id"`
	Lat    float64 `json:"lat"`
	Lng    float64 `json:"lng"`
}
