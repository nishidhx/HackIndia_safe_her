package websocket

import (
	"log"
	"net/http"
)

var ManagerInstance = NewManager()

func LocationSocket(writer http.ResponseWriter, request *http.Request) {
	conn, err := Upgrader.Upgrade(writer, request, nil)
	if err != nil {
		log.Println("upgrade error: ", err)
		return
	}

	client := &Client{
		Conn: conn,
	}

	ManagerInstance.register <- client

	log.Println("Client connected")

	go client.ReadPump()
}
