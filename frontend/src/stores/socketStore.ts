import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { useRoomsStore } from './roomsStore'
import router from '@/router'

export const useSocketStore = defineStore('socketStore', () => {
  const socket = new WebSocket('ws://127.0.0.1:8000/ws')
  const socketMessage = ref('')
  const chatMessages: Ref<any[]> = ref([])
  const gameState: Ref<any> = ref()
  const yourUsername: Ref<string> = ref("")

  const roomsStore = useRoomsStore()

  function tryParseControl(string: string) {
    try {
      const o = JSON.parse(string)
      if (o && typeof o === 'object' && o.length == 2) {
        return o
      }
    } catch (e) {
      return false
    }
    return false
  }

  function sendControl(name: any, data: any = {}) {
    socket.send(JSON.stringify([name, data]));
  }

  function interpretControl(control: any) {
    const controlParts = control[0].split('/');
    switch (controlParts[0]) {
      case 'rooms':
        switch (controlParts[1]) {
          case 'joined':
            chatMessages.value.push(`You have joined room: ${control[1].name}.`)
            roomsStore.currentRoom = control[1]
            break;
          case 'said':
            chatMessages.value.push(control[1])
            break;
          case 'update':
            roomsStore.currentRoom = control[1]
            break;
        }
        break;
      case 'game':
        switch (controlParts[1]) {
          case "updatePixel":
            gameState.value.board[control[1].index] = control[1].color
            break;
          case 'set':
            if (control[1].gameName) {
              chatMessages.value.push(`New ${control[1].gameName} game started`)
            }
          case 'update':
            gameState.value = control[1]
            break;
          case 'ended':
            chatMessages.value.push(`${control[1].winner} won ${control[1].gameName}!`)
            gameState.value = control[1]
            break;
          default:
            console.log("Unknown game control")
            break;
        }
    }
  }
  function sendMessage() {
    const message = socketMessage.value
    socket.send(message)
  }

  // socket.addEventListener('open', () => {
  //   // console.log('Connected to server')
  //   // socket.send('Hello from client')
  // })

  socket.addEventListener('message', (event) => {
    // console.log("Message from server: ", event.data);
    // const data = tryParseJson(event.data)
    const control = tryParseControl(event.data)
    // console.log(parsedData)
    if (control) {
      console.log(`${control[0]}: ${JSON.stringify(control[1])}`)
      interpretControl(control)
      // currentRoomId.value = data.roomId
      // if ('roomName' in data) {
      //   currentRoomName.value = data.roomName
      // }
      // if ('roomId' in data) {
      //   currentRoomId.value = data.roomId
      // }
    } else {
      console.debug(event.data)
    }
  })

  socket.addEventListener('close', () => {
    console.log('Connection closed')
    router.push({ name: 'auth' })
  })

  return {
    socket,
    sendMessage,
    sendControl,
    chatMessages,
    gameState,
    yourUsername
  }
})
