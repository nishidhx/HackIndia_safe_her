package websocket

import (
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID   string
	Conn *websocket.Conn
}

func (c *Client) ReadPump() {

	defer c.Conn.Close()

	var msg LocationMessage
	for {
		err := c.Conn.ReadJSON(&msg)
		if err != nil {
			log.Println("read error: ", err)
			break
		}
		log.Println("User:", msg.UserId, "Lat:", msg.Lat, "Lng:", msg.Lng)
	}

}
