<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRoomsStore } from '@/stores/roomsStore';
import { useSocketStore } from '@/stores/socketStore';

const roomsStore = useRoomsStore()
const socketStore = useSocketStore()

const isMouseDown = ref(false)
const selectedColor = ref("#ffffff")

const messageToSay = ref('')
function sayInRoom() {
  if (!messageToSay.value) return
  socketStore.sendControl('rooms/say', messageToSay.value)
  messageToSay.value = ""
}

function setSelectedColor(color: string) {
  console.log("color selected", color)
  selectedColor.value = color
}

const isYourTurnRockPaperScissors = computed(() => {
  if (socketStore.gameState.winner) {
    return false;
  }
  if (socketStore.gameState?.gameName != 'RockPaperScissors') {
    return false;
  }
  if (!socketStore.gameState.playerSpots.map((e: any) => e?.player?.username).includes(socketStore.yourUsername)) {
    return false
  }
  if (socketStore.gameState.your_strategic_data) {
    return false
  }
  return true
});

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

function drawIfMousePressed(i: number) {
  if (isMouseDown.value) {
    draw(i)
  }
}

function draw(i: number) {
  socketStore.gameState.board[i] = selectedColor.value
  socketStore.sendControl('game/place', { index: i, color: selectedColor.value })
}

onMounted(() => {
  window.addEventListener('mousedown', () => {
    isMouseDown.value = true
  })

  window.addEventListener('mouseup', () => {
    isMouseDown.value = false
  })
})
</script>

<template>
  <div v-text="`room: ${roomsStore.currentRoom.name} (id: ${roomsStore.currentRoom.id})`"></div>
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
        <div style="height: 100%;" v-if="socketStore.gameState">
          <div v-if="socketStore.gameState.gameName == 'RockPaperScissors'">
            <div class="h-12 w-full text-center text-4xl">
              <span v-if="socketStore.gameState.winner">
                <span v-if="socketStore.gameState.winner != 'draw'">winner: </span>{{ socketStore.gameState.winner }}
              </span>
            </div>
            <div class="flex flex-row justify-center">
              <div class="flex flex-col gap-4 w-full pl-8 pr-8">
                <Button v-for="choice in ['rock', 'paper', 'scissors']" :disabled="!isYourTurnRockPaperScissors"
                  @click="() => { socketStore.sendControl('game/place', choice) }"
                  class="border-gray-300 border-2 border-solid h-24 w-full text-6xl text-center">
                  {{ choice }}
                </Button>
              </div>
            </div>
          </div>
          <div v-if="socketStore.gameState.gameName == 'TicTacToe'">
            <div class="h-12 w-full text-center text-4xl">
              <span v-if="socketStore.gameState.winner">
                winner: {{ socketStore.gameState.winner }}
              </span>
            </div>
            <div class="flex flex-row justify-center">
              <div class="grid grid-cols-3 gap-4 w-80">
                <Button v-for="spot, i in socketStore.gameState.board" :disabled="spot || !isItYourTicTacToeTurn"
                  @click="() => { socketStore.sendControl('game/place', i) }"
                  :class="(spot ? 'text-6xl' : 'text-2xl') + ' border-gray-300 border-2 border-solid h-24 w-24 text-center'">
                  {{ spot || (i + 1) }}
                </Button>
              </div>
            </div>
          </div>
          <div style="height: 100%;" v-else-if="socketStore.gameState.gameName == 'Drawing'">
            <div class="h-1/6 w-full text-center flex flex-col select-none">
              <div v-for="lightnessIterator in 11" style="height: 12.5%; width: 100%; display: flex">
                <div v-for="hueIterator in 40" style="height: 100%; width: 2.5%;">
                  <div
                    @click="() => { setSelectedColor(`hsl(${hueIterator * 9} 50% ${(11 - lightnessIterator) * 10}%)`) }"
                    :style="`width: 100%; height: 100%; background-color: hsl(${hueIterator * 9} 50% ${(11 - lightnessIterator) * 10}%);`">
                  </div>
                </div>
              </div>
            </div>
            <!-- <div class="flex flex-row justify-center w-full h-full"> -->
            <div class="w-full h-5/6 select-none"
              style="display: grid; grid-template-columns: repeat(30, 3.333%); grid-template-rows: repeat(30, 3.333%);">
              <div style="width: 100%; height: 100%;" v-for="field, i in socketStore.gameState.board">
                <div @click="draw(i)" @mouseover="drawIfMousePressed(i)"
                  :style="`background-color: ${field}; width: 100%; height: 100%;`">
                </div>
              </div>
            </div>
            <!-- </div> -->
          </div>
        </div>
      </div>
    </div>
    <div class="w-3/12 h-120">
      <div class="h-full w-full border-2 border-solid border-gray-500 flex flex-col justify-between items-center">
        <div>
          <div v-if="socketStore?.gameState?.playerSpots">
            Game roles:
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
          <div class="mt-6">
            All users in room:
            <div v-for="player in roomsStore.currentRoom.users">
              - {{ player.username }}
            </div>
          </div>

          <div v-if="roomsStore?.currentRoom?.ownerName" class="mt-6">
            Room's owner: {{ roomsStore.currentRoom.ownerName }}
          </div>
        </div>
        <div class="flex flex-col gap-1 mb-2">
          <Button :disabled="roomsStore.currentRoom.ownerName != socketStore.yourUsername"
            @click="() => { socketStore.sendControl('rooms/setGame', 'tictactoe') }">
            set game to TicTacToe
          </Button>
          <Button :disabled="roomsStore.currentRoom.ownerName != socketStore.yourUsername"
            @click="() => { socketStore.sendControl('rooms/setGame', 'drawing') }">
            set game to drawing
          </Button>
          <Button :disabled="roomsStore.currentRoom.ownerName != socketStore.yourUsername"
            @click="() => { socketStore.sendControl('rooms/setGame', 'rockpaperscissors') }">
            set game to rock paper scissors
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>