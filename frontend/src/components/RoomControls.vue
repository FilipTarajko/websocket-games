<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { computed } from 'vue'

import { useRoomsStore } from '@/stores/roomsStore'
import { useSocketStore } from '@/stores/socketStore'
const roomsStore = useRoomsStore()
const socketStore = useSocketStore()

const playerHasGameRole = computed(() => {
  return socketStore.gameState?.playerSpots?.find(
    (e: any) => e?.player?.username == socketStore.yourUsername
  )
})

const gameNames = ['TicTacToe', 'Drawing', 'RockPaperScissors']

function toggleKeepPlayersInSpots() {
  socketStore.changeSetting(
    'keepPlayersInSpots',
    !roomsStore.currentRoom.settings.keepPlayersInSpots
  )
}
</script>

<template>
  <div
    class="h-full w-full border-2 border-solid border-gray-500 flex flex-col justify-between items-center"
  >
    <div>
      <div v-if="socketStore?.gameState?.playerSpots">
        <div class="my-1">Game roles:</div>
        <div v-for="(playerSpot, i) in socketStore.gameState?.playerSpots" class="h-8">
          {{ playerSpot.name }}:
          {{ playerSpot.player?.username ?? 'empty' }}
          <span v-if="!playerSpot.player">
            <Button @click="socketStore.sendControl('game/takeSpot', i)" class="h-6">join</Button>
          </span>
        </div>
        <Button :disabled="!playerHasGameRole" @click="socketStore.sendControl('game/leaveSpot')"
          >leave role</Button
        >
      </div>
      <div class="mt-6">
        All users in room:
        <div v-for="player in roomsStore.currentRoom.users">- {{ player.username }}</div>
      </div>

      <div v-if="roomsStore?.currentRoom?.ownerName" class="mt-6">
        Room's owner: {{ roomsStore.currentRoom.ownerName }}
      </div>
    </div>
    <div class="flex flex-col gap-1 mb-2">
      <div class="flex gap-4">
        <Label for="keepPlayersInSpotsSwitch">keep players in spots</Label>
        <Switch
          :disabled="roomsStore.currentRoom.ownerName != socketStore.yourUsername"
          id="keepPlayersInSpotsSwitch"
          :checked="roomsStore.currentRoom.settings.keepPlayersInSpots"
          @click="toggleKeepPlayersInSpots()"
        />
      </div>
      <Button
        v-for="gameName in gameNames"
        :disabled="roomsStore.currentRoom.ownerName != socketStore.yourUsername"
        @click="socketStore.setGame(gameName)"
      >
        set game to {{ gameName }}
      </Button>
    </div>
  </div>
</template>
