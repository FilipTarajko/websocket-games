import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { useSocketStore } from './socketStore'

export const useRoomsStore = defineStore('roomsStore', () => {
  const currentRoom: Ref<{ name: string, id: number, ownerName: string | null }> = ref({ name: 'none', id: 0, ownerName: null })
  const rooms: Ref<Array<any>> = useStorage('rooms', [])

  const socketStore = useSocketStore()

  getRooms()
  setInterval(async () => {
    getRooms()
  }, 1000)

  function getRooms() {
    fetch('http://localhost:8000/rooms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        rooms.value = data
      })
  }

  function createRoom(roomName: string) {
    socketStore.socket.send(JSON.stringify({ action: 'createRoom', roomName }))
  }

  return {
    currentRoom,
    rooms,
    // createRoom
  }
})
