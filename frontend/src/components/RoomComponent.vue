<script setup lang="ts">
import { computed, ref } from 'vue';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRoomsStore } from '@/stores/roomsStore';
import { useSocketStore } from '@/stores/socketStore';

const roomsStore = useRoomsStore()
const socketStore = useSocketStore()

const messageToSay = ref('')
function sayInRoom() {
  if (!messageToSay.value) return
  socketStore.sendControl('rooms/say', messageToSay.value)
  messageToSay.value = ""
}

const isItYourTicTacToeTurn = computed(() => {
  if (socketStore.gameState.winner) {
    return false;
  }
  if (socketStore.gameState?.gameName != 'TicTacToe') {
    return false;
  }
  if (!socketStore.gameState.playerSpots.map((e: any) => e?.player?.username).includes(socketStore.yourUsername)) {
    return false
  }
  const yourSpot = socketStore.gameState.playerSpots.find((e: any) => e.player?.username == socketStore.yourUsername)
  if (yourSpot.name == "X" && socketStore.gameState.turn % 2 == 0) {
    return false;
  }
  if (yourSpot.name == "O" && socketStore.gameState.turn % 2 == 1) {
    return false;
  }
  return true
});

</script>

<template>
  <div v-text="`room: ${roomsStore.currentRoom.name} (${roomsStore.currentRoom.id})`"></div>
  <div class="flex flex-row mt-4 ">
    <div class="w-3/12">
      <div id="chat" class="border-solid border-2 border-gray-500 h-96 overflow-auto">
        <template v-for="message in socketStore.chatMessages">
          <div v-if="message.author">
            <span v-text="message.author.username"></span>:
            <span v-text="message.message"></span>
          </div>
          <div v-else>
            <hr style="margin-top: -0.5px; margin-bottom: 2px; border-color: gray;">
            <span v-text="message"></span>
          </div>
        </template>
      </div>
      <div class="flex">
        <Input v-model="messageToSay" type="text" id="messageText" />
        <Button @click="sayInRoom">send</Button>
      </div>
    </div>
    <div class="w-6/12 h-120 px-2">
      <div id="game-content" class="h-full w-full border-2 border-solid border-gray-500">
        <div v-if="socketStore.gameState">
          <div class="h-12 w-full text-center text-4xl">
            <span v-if="socketStore.gameState.winner">
              winner: {{ socketStore.gameState.winner }}
            </span>
          </div>
          <div v-if="socketStore.gameState.gameName == 'TicTacToe'">
            <div class="flex flex-row justify-center">
              <div class="grid grid-cols-3 gap-4 w-80">
                <Button v-for="spot, i in socketStore.gameState.board" :disabled="spot || !isItYourTicTacToeTurn"
                  @click="() => { socketStore.sendControl('game/place', i) }"
                  class="border-gray-300 border-2 border-solid h-24 w-24 text-6xl text-center">
                  {{ spot || i + 1 }}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-3/12 h-120">
      <div class="h-full w-full border-2 border-solid border-gray-500 flex flex-col justify-between items-center">
        <div>
          Players
          <div v-for="playerSpot, i in socketStore.gameState?.playerSpots">
            {{ playerSpot.name }}:
            <span>
              <span v-if="playerSpot.player">
                {{ playerSpot.player.username }}
              </span>
              <span v-else>
                empty
                <Button @click="() => { socketStore.sendControl('game/takeSpot', i) }">join</Button>
              </span>
            </span>
          </div>

        </div>
        <div>
          <Button :disabled="roomsStore.currentRoom.ownerName != socketStore.yourUsername"
            @click="() => { socketStore.sendControl('rooms/setGame', 'tictactoe') }">
            set game to TicTacToe
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>