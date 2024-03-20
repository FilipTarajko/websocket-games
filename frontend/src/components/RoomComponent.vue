<script setup lang="ts">
import { ref } from 'vue';
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
        game content
        <div v-if="socketStore.gameState">
          {{ socketStore.gameState }}
          <div v-if="socketStore.gameState.gameName == 'TicTacToe'">
            <div>
              <div class="grid grid-cols-3 gap-4 w-80">
                <div v-for="spot, i in socketStore.gameState.board"
                  class="border-gray-300 border-2 border-solid h-24 w-24 text-6xl text-center">
                  {{ i }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="w-3/12 h-120">
      <div class="h-full w-full border-2 border-solid border-gray-500 flex flex-col justify-between items-center">
        <div>
          placeholder
        </div>
        <div>
          <Button @click="() => { socketStore.sendControl('rooms/setGame', 'tictactoe') }">set game to TicTacToe</Button>
        </div>
      </div>
    </div>
  </div>
</template>