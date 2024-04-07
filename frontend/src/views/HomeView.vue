<script setup lang="ts">
import RoomsList from '@/components/RoomsList.vue';
import RoomComponent from '@/components/RoomComponent.vue';
import { useSocketStore } from '@/stores/socketStore';
import router from '@/router';
import { onMounted } from 'vue';
const socketStore = useSocketStore();

onMounted(async () => {
  const response = await fetch('http://127.0.0.1:8000/cookies', {
    method: 'GET',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
  let cookies = (await response.json())
  if ("token" in cookies) {
    // console.log("Token found, setting up socket")
    socketStore.setupSocket();
  } else {
    socketStore.yourUsername = ''
    router.push('/auth');
  }
  console.log(socketStore.socket);
})


</script>

<template>
  <h1 class="text-2xl mt-16">Rooms</h1>
  <RoomsList></RoomsList>
  <h1 class="text-2xl mt-16">Current room</h1>
  <RoomComponent></RoomComponent>
</template>
