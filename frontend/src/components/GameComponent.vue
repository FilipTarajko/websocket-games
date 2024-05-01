<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { useSocketStore } from '@/stores/socketStore'

const socketStore = useSocketStore()

const isMouseDown = ref(false)
const selectedColor = ref('#ffffff')

function setSelectedColor(color: string) {
  console.log('color selected', color)
  selectedColor.value = color
}

const isYourTurnRockPaperScissors = computed(() => {
  if (socketStore.gameState.winner) {
    return false
  }
  if (socketStore.gameState?.gameName != 'RockPaperScissors') {
    return false
  }
  if (
    !socketStore.gameState.playerSpots
      .map((e: any) => e?.player?.username)
      .includes(socketStore.yourUsername)
  ) {
    return false
  }
  if (socketStore.gameState.your_strategic_data) {
    return false
  }
  return true
})

const isItYourTicTacToeTurn = computed(() => {
  if (socketStore.gameState.winner) {
    return false
  }
  if (socketStore.gameState?.gameName != 'TicTacToe') {
    return false
  }
  if (
    !socketStore.gameState.playerSpots
      .map((e: any) => e?.player?.username)
      .includes(socketStore.yourUsername)
  ) {
    return false
  }
  const yourSpot = socketStore.gameState.playerSpots.find(
    (e: any) => e.player?.username == socketStore.yourUsername
  )
  if (yourSpot.name == 'X' && socketStore.gameState.turn % 2 == 0) {
    return false
  }
  if (yourSpot.name == 'O' && socketStore.gameState.turn % 2 == 1) {
    return false
  }
  return true
})

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
  <div id="game-content" class="h-full w-full border-2 border-solid border-gray-500">
    <div style="height: 100%" v-if="socketStore.gameState">
      <div v-if="socketStore.gameState.gameName == 'RockPaperScissors'">
        <div class="h-12 w-full text-center text-4xl">
          <span v-if="socketStore.gameState.winner">
            <span v-if="socketStore.gameState.winner != 'draw'">winner: </span
            >{{ socketStore.gameState.winner }}
          </span>
        </div>
        <div class="flex flex-row justify-center">
          <div class="flex flex-col gap-4 w-full pl-8 pr-8">
            <Button
              v-for="choice in ['rock', 'paper', 'scissors']"
              :disabled="!isYourTurnRockPaperScissors"
              @click="socketStore.sendControl('game/place', choice)"
              class="border-gray-300 border-2 border-solid h-16 xxs:h-24 w-full text-4xl xxxs:text-5xl xxs:text-6xl text-center"
            >
              {{ choice }}
            </Button>
          </div>
        </div>
        <div class="h-12 mt-2 w-full text-center">
          <Button v-if="socketStore.gameState.winner" @click="socketStore.playAgain()">
            play again
          </Button>
        </div>
      </div>
      <div v-else-if="socketStore.gameState.gameName == 'TicTacToe'">
        <div class="h-12 w-full text-center text-4xl">
          <span v-if="socketStore.gameState.winner">
            winner: {{ socketStore.gameState.winner }}
          </span>
        </div>
        <div class="flex flex-row justify-center">
          <div class="grid grid-cols-3 gap-4 w-full xxs:w-80">
            <Button
              v-for="(spot, i) in socketStore.gameState.board"
              :disabled="spot || !isItYourTicTacToeTurn"
              @click="socketStore.sendControl('game/place', i)"
              :class="
                (spot ? 'text-6xl' : 'text-2xl') +
                ' border-gray-300 border-2 border-solid h-full xxs:h-24 aspect-square text-center'
              "
            >
              {{ spot || i + 1 }}
            </Button>
          </div>
        </div>
        <div class="h-12 mt-2 w-full text-center">
          <Button v-if="socketStore.gameState.winner" @click="socketStore.playAgain()">
            play again
          </Button>
        </div>
      </div>
      <div style="height: 100%" v-else-if="socketStore.gameState.gameName == 'Drawing'">
        <div class="h-1/6 w-full text-center flex flex-col select-none">
          <div v-for="lightnessIterator in 11" style="height: 12.5%; width: 100%; display: flex">
            <div v-for="hueIterator in 40" style="height: 100%; width: 2.5%">
              <div
                @click="
                  setSelectedColor(`hsl(${hueIterator * 9} 50% ${(11 - lightnessIterator) * 10}%)`)
                "
                :style="`width: 100%; height: 100%; background-color: hsl(${hueIterator * 9} 50% ${(11 - lightnessIterator) * 10}%);`"
              ></div>
            </div>
          </div>
        </div>
        <div
          class="w-full h-5/6 select-none"
          style="
            display: grid;
            grid-template-columns: repeat(40, 2.5%);
            grid-template-rows: repeat(30, 3.333%);
          "
        >
          <div style="width: 100%; height: 100%" v-for="(field, i) in socketStore.gameState.board">
            <div
              @click="draw(i)"
              @mouseover="drawIfMousePressed(i)"
              :style="`background-color: ${field}; width: 100%; height: 100%;`"
            ></div>
          </div>
        </div>
      </div>
      <div v-else class="text-center mt-6 text-2xl">no game selected</div>
    </div>
  </div>
</template>
