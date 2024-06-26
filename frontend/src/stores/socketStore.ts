import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { useRoomsStore } from './roomsStore'
import router from '@/router'

export const useSocketStore = defineStore('socketStore', () => {
  let socket: WebSocket | null = null
  const socketMessage = ref('')
  const chatMessages: Ref<any[]> = ref([])
  const gameState: Ref<any> = ref()
  const yourUsername: Ref<string> = ref('')

  const roomsStore = useRoomsStore()

  function setupSocket() {
    if (socket) {
      return
    }
    socket = new WebSocket(import.meta.env.VITE_BACKEND_WS_ADDRESS + '/ws/')

    socket.addEventListener('message', (event) => {
      const control = tryParseControl(event.data)
      if (control) {
        if (import.meta.env.ENVIRONMENT === 'development') {
          console.log(`${control[0]}: ${JSON.stringify(control[1])}`)
        }
        interpretControl(control)
      }
    })

    socket.addEventListener('close', () => {
      router.push({ name: 'auth' })
    })
  }

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

  function sendControl(name: string, data: any = {}) {
    if (socket) {
      socket.send(JSON.stringify([name, data]))
    }
  }

  function setGame(gameName: string) {
    sendControl('rooms/setGame', {
      name: gameName.toLowerCase()
    })
  }

  function playAgain() {
    sendControl('rooms/setGame', {
      name: gameState.value.gameName.toLowerCase()
    })
  }

  function changeSetting(name: string, value: any) {
    sendControl('rooms/changeSetting', {
      name: name,
      value: value
    })
  }

  function interpretControl(control: [string, any]) {
    const controlParts = control[0].split('/')
    switch (controlParts[0]) {
      case 'rooms':
        switch (controlParts[1]) {
          case 'joined':
            chatMessages.value.push(`You have joined room: ${control[1].name}.`)
            roomsStore.currentRoom = control[1]
            break
          case 'said':
            chatMessages.value.push(control[1])
            break
          case 'update':
            roomsStore.currentRoom = control[1]
            break
          case 'updateList':
            roomsStore.rooms = control[1]
            break
          case 'changeSetting':
            if (control[1].name in roomsStore.currentRoom.settings) {
              ;(roomsStore.currentRoom.settings as any)[control[1].name] = control[1].value
            }
            break
          case 'wrong_password':
            let elem = document.getElementById(`room${control[1].roomId}password`)
            if (elem && elem.style) {
              elem.style.backgroundColor = 'red'
              setTimeout(() => {
                if (elem && elem.style) {
                  elem.style.backgroundColor = ''
                }
              }, 130)
            }
            break
        }
        break
      case 'game':
        switch (controlParts[1]) {
          case 'updatePixel':
            gameState.value.board[control[1].index] = control[1].color
            break
          case 'set':
            if (control[1].gameName) {
              chatMessages.value.push(`New ${control[1].gameName} game started`)
            }
          case 'update':
            gameState.value = control[1]
            break
          case 'ended':
            chatMessages.value.push(`${control[1].winner} won ${control[1].gameName}!`)
            gameState.value = control[1]
            break
          default:
            break
        }
    }
  }

  function sendMessage() {
    if (socket) {
      const message = socketMessage.value
      socket.send(message)
    }
  }

  return {
    socket,
    sendMessage,
    sendControl,
    chatMessages,
    setupSocket,
    gameState,
    yourUsername,
    playAgain,
    setGame,
    changeSetting
  }
})
