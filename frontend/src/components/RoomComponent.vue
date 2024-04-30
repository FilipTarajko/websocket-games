<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useRoomsStore } from '@/stores/roomsStore';
import { useSocketStore } from '@/stores/socketStore';

const roomsStore = useRoomsStore()
const socketStore = useSocketStore()

const isMouseDown = ref(false)
const selectedColor = ref("#ffffff")

const keepPlayersInSpots = ref(true);

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

const playerHasGameRole = computed(() => {
  return socketStore.gameState?.playerSpots?.find((e: any) => e?.player?.username == socketStore.yourUsername)
})

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
  <div class="flex flex-row mt-4 flex-wrap">
    <div class="grid h-120 w-full xs:w-1/2 lg:w-3/12 order-3 xs:order-2 lg:order-1" style="grid-template-rows: 1fr auto;">
      <div id="chat" class="border-solid border-2 border-gray-500 overflow-auto mb-2">
        <template v-for="message in socketStore.chatMessages">
          <div v-if="message.author" class="pl-1">
            <span v-text="message.author.username"></span>:
            <span v-text="message.message"></span>
          </div>
          <div v-else style="background-color: hsla(120, 100%, 50%, 0.2);" class="my-1 pl-1">
            <span v-text="message"></span>
          </div>
        </template>
      </div>
      <div class="flex">
        <Input v-model="messageToSay" type="text" id="messageText" />
        <Button @click="sayInRoom">send</Button>
      </div>
    </div>
    <div class="h-[23rem] xxs:h-120 w-full lg:w-6/12 order-1 lg:order-2 mb-2 lg:mb-0 px-0 lg:px-2">
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
                  class="border-gray-300 border-2 border-solid h-16 xxs:h-24 w-full text-4xl xxxs:text-5xl xxs:text-6xl text-center">
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
              <div class="grid grid-cols-3 gap-4 w-full xxs:w-80">
                <Button v-for="spot, i in socketStore.gameState.board" :disabled="spot || !isItYourTicTacToeTurn"
                  @click="() => { socketStore.sendControl('game/place', i) }"
                  :class="(spot ? 'text-6xl' : 'text-2xl') + ' border-gray-300 border-2 border-solid h-full xxs:h-24 aspect-square text-center'">
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
              style="display: grid; grid-template-columns: repeat(40, 2.5%); grid-template-rows: repeat(30, 3.333%);">
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
    <div class="h-120 w-full xs:w-1/2 lg:w-3/12 mb-2 xs:mb-0 order-2 xs:order-3 xs:pl-2 lg:pl-0">
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
            <Button :disabled="!playerHasGameRole" @click="() => { socketStore.sendControl('game/leaveSpot') }">leave
              role</Button>
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
          <div class="flex gap-4">
            <Label for="keepPlayersInSpotsSwitch">keep players in spots</Label>
            <Switch :disabled="roomsStore.currentRoom.ownerName != socketStore.yourUsername" id="keepPlayersInSpotsSwitch"
              v-model:checked="keepPlayersInSpots" />
          </div>
          <Button :disabled="roomsStore.currentRoom.ownerName != socketStore.yourUsername"
            @click="() => { socketStore.sendControl('rooms/setGame', { name: 'tictactoe', keepPlayersInSpots }) }">
            set game to TicTacToe
          </Button>
          <Button :disabled="roomsStore.currentRoom.ownerName != socketStore.yourUsername"
            @click="() => { socketStore.sendControl('rooms/setGame', { name: 'drawing', keepPlayersInSpots }) }">
            set game to drawing
          </Button>
          <Button :disabled="roomsStore.currentRoom.ownerName != socketStore.yourUsername"
            @click="() => { socketStore.sendControl('rooms/setGame', { name: 'rockpaperscissors', keepPlayersInSpots }) }">
            set game to rock paper scissors
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>