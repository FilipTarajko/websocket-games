<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRoomsStore } from '@/stores/roomsStore'
import { useSocketStore } from '@/stores/socketStore'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useColorMode } from '@vueuse/core'

const mode = useColorMode()

const roomsStore = useRoomsStore()
const socketStore = useSocketStore()

const newRoomData = ref({
  name: '',
  password: ''
})

function createRoom() {
  socketStore.sendControl('rooms/create', newRoomData.value)
}

function joinRoom(id: number) {
  socketStore.sendControl('rooms/join', {
    newRoomId: id,
    // @ts-ignore
    password: document.getElementById(`room${id}password`)?.value
  })
}

function roomBackgroundColor(roomId: number) {
  return roomId == roomsStore.currentRoom.id
    ? `background-color: hsl(120 80% ${mode.value == 'dark' ? '10%' : '85%'});`
    : ''
}
</script>

<template>
  <div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Id</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Users</TableHead>
          <TableHead>Game</TableHead>
          <TableHead>Password</TableHead>
          <TableHead>Join</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="room in roomsStore.rooms"
          :key="room.id"
          :style="roomBackgroundColor(room.id)"
        >
          <TableCell>{{ room.id }}</TableCell>
          <TableCell>{{ room.name }}</TableCell>
          <TableCell>{{ room.usersLenght }}</TableCell>
          <TableCell>{{ room.gameName }}</TableCell>
          <TableCell>
            <div v-if="room.hasPassword > 0">
              <Input
                placeholder="password"
                type="password"
                :id="`room${room.id}password`"
                class="w-40"
              ></Input>
            </div>
            <div v-else>public</div>
          </TableCell>
          <TableCell>
            <Button
              @click="joinRoom(room.id)"
              :disabled="room.id == roomsStore.currentRoom.id"
              size="sm"
            >
              <span v-if="room.id == roomsStore.currentRoom.id">you are here</span>
              <span v-else>join</span>
            </Button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell></TableCell>
          <TableCell colspan="1"
            ><Input
              v-model="newRoomData.name"
              :placeholder="socketStore.yourUsername + '\'s room'"
              class="mr-2"
              type="text"
              id="newRoomName"
            />
          </TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell colspan="1"
            ><Input
              v-model="newRoomData.password"
              placeholder="password (optional)"
              class="mr-2 w-40"
              type="password"
              id="newRoomPassword"
            />
          </TableCell>
          <TableCell><Button @click="createRoom">create room</Button></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
