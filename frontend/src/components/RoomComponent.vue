<script setup lang="ts">
import { useRoomsStore } from '@/stores/roomsStore'
import RoomControls from '@/components/RoomControls.vue'
import GameComponent from '@/components/GameComponent.vue'
import ChatComponent from '@/components/ChatComponent.vue'

const roomsStore = useRoomsStore()
</script>

<template>
  <div v-text="`room: ${roomsStore.currentRoom.name} (id: ${roomsStore.currentRoom.id})`"></div>
  <div class="flex flex-row mt-4 flex-wrap">
    <div
      class="grid h-120 w-full xs:w-1/2 lg:w-3/12 order-3 xs:order-2 lg:order-1"
      style="grid-template-rows: 1fr auto"
    >
      <ChatComponent />
    </div>
    <div class="h-[26rem] xxs:h-120 w-full lg:w-6/12 order-1 lg:order-2 mb-2 lg:mb-0 px-0 lg:px-2">
      <GameComponent />
    </div>
    <div class="h-120 w-full xs:w-1/2 lg:w-3/12 mb-2 xs:mb-0 order-2 xs:order-3 xs:pl-2 lg:pl-0">
      <RoomControls />
    </div>
  </div>
</template>
