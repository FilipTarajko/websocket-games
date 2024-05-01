<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSocketStore } from '@/stores/socketStore'

const socketStore = useSocketStore()

const messageToSay = ref('')
function sayInRoom() {
  if (!messageToSay.value) return
  socketStore.sendControl('rooms/say', messageToSay.value)
  messageToSay.value = ''
}
</script>

<template>
  <div id="chat" class="border-solid border-2 border-gray-500 overflow-auto mb-2">
    <template v-for="message in socketStore.chatMessages">
      <div v-if="message.author" class="pl-1">
        <span v-text="message.author.username"></span>:
        <span v-text="message.message"></span>
      </div>
      <div v-else style="background-color: hsla(120, 100%, 50%, 0.2)" class="my-1 pl-1">
        <span v-text="message"></span>
      </div>
    </template>
  </div>
  <form class="flex" @submit.prevent="sayInRoom">
    <Input v-model="messageToSay" type="text" id="messageText" />
    <Button type="submit" class="ml-2">send</Button>
  </form>
</template>
