<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRoomsStore } from '@/stores/roomsStore';
import { useSocketStore } from '@/stores/socketStore';

const roomsStore = useRoomsStore()
const socketStore = useSocketStore()

const messageToSay = ref('')
const newRoomName = ref('')

function sayInRoom() {
    socketStore.sendControl('rooms/say', messageToSay.value)
}

function createRoom() {
    socketStore.sendControl('rooms/create', newRoomName.value)
}

function joinRoom(id: number) {
    socketStore.sendControl('rooms/join', id)
}
</script>

<template>
    <h1>Rooms</h1>
    <div v-text="`room: ${roomsStore.currentRoom.name} (${roomsStore.currentRoom.id})`"></div>
    <div v-for="room in roomsStore.rooms">
        {{ room.id }} | {{ room.name }} | {{ room.usersLenght }} | {{
            room.public ? "public" : "private"
        }}
        <Button @click="() => { joinRoom(room.id) }" size="sm"
            :disabled="!room.public || room.id == roomsStore.currentRoom.id">join</Button>
    </div>
    <Button @click="() => { joinRoom(1) }" :disabled="roomsStore.currentRoom.id == 1">back to lobby</Button>
    <div class="flex mt-4">
        <Input v-model="newRoomName" class="mr-2" type="text" id="newRoomName" />
        <Button @click="createRoom">create room</Button>
    </div>
    <div class="flex mt-16">
        <Input v-model="messageToSay" class="mr-2" type="text" id="messageText" />
        <Button @click="sayInRoom">send message</Button>
    </div>
</template>