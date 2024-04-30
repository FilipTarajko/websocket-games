import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useRoomsStore = defineStore('roomsStore', () => {
  const currentRoom: Ref<{ name: string; id: number; ownerName: string | null; users: any[] }> =
    ref({ name: 'none', id: 0, ownerName: null, users: [] })
  const rooms: Ref<Array<any>> = useStorage('rooms', [])

  return {
    currentRoom,
    rooms
  }
})
