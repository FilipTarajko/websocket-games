<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRoomsStore } from '@/stores/roomsStore';
import { useSocketStore } from '@/stores/socketStore';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const roomsStore = useRoomsStore()
const socketStore = useSocketStore()

const newRoomName = ref('')

function createRoom() {
  socketStore.sendControl('rooms/create', newRoomName.value)
}

function joinRoom(id: number) {
  socketStore.sendControl('rooms/join', id)
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
          <TableHead>Public</TableHead>
          <TableHead>Join</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="room in roomsStore.rooms" :key="room.id">
          <TableCell>{{ room.id }}</TableCell>
          <TableCell>{{ room.name }}</TableCell>
          <TableCell>{{ room.usersLenght }}</TableCell>
          <TableCell>{{ room.gameName }}</TableCell>
          <TableCell>{{ room.public ? "public" : "private" }}</TableCell>
          <TableCell>
            <Button @click="() => { joinRoom(room.id) }" size="sm"
              :disabled="!room.public || room.id == roomsStore.currentRoom.id">
              <span v-if="room.id == roomsStore.currentRoom.id">you are here</span>
              <span v-else-if="!room.public">room is private</span>
              <span v-else>join</span>
            </Button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell></TableCell>
          <TableCell colspan="1"><Input v-model="newRoomName" class="mr-2" type="text" id="newRoomName" /></TableCell>
          <TableCell><Button @click="createRoom">create room</Button></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>