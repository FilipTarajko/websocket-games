import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

export const useRoomsStore = defineStore('roomsStore', () => {
  const currentRoom: Ref<{
    name: string
    id: number
    ownerName: string | null
    users: any[]
    settings: {
      keepPlayersInSpots: boolean
    }
  }> = ref({
    name: 'none',
    id: 0,
    ownerName: null,
    users: [],
    settings: { keepPlayersInSpots: true }
  })
  const rooms: Ref<Array<any>> = ref([])

  return {
    currentRoom,
    rooms
  }
})
