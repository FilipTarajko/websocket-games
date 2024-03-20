import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSocketStore = defineStore('socketStore', () => {
  const socket = new WebSocket('ws://localhost:8000/ws')
  const socketMessage = ref('')

  function tryParseJson(jsonString: string) {
    try {
      const o = JSON.parse(jsonString)
      if (o && typeof o === 'object') {
        return o
      }
    } catch (e) {
      console.log(e)
    }
    return false
  }

  function sendMessage() {
    const message = socketMessage.value
    socket.send(message)
  }

  socket.addEventListener('open', () => {
    console.log('Connected to server')
    socket.send('Hello from client')
  })

  socket.addEventListener('message', (event) => {
    // console.log("Message from server: ", event.data);
    const data = tryParseJson(event.data)
    if (data) {
      console.log(data)
      // currentRoomId.value = data.roomId
      // if ('roomName' in data) {
      //   currentRoomName.value = data.roomName
      // }
      // if ('roomId' in data) {
      //   currentRoomId.value = data.roomId
      // }
    } else {
      console.log(event.data)
    }
  })

  socket.addEventListener('close', () => {
    console.log('Connection closed')
  })

  return {
    socket,
    sendMessage
  }
})
