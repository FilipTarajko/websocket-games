<script setup lang="ts">
import RoomsList from '@/components/RoomsList.vue';
import RoomComponent from '@/components/RoomComponent.vue';
import { useSocketStore } from '@/stores/socketStore';
import router from '@/router';
import { onMounted } from 'vue';
import { useJwt } from '@vueuse/integrations/useJwt';
const socketStore = useSocketStore();

onMounted(async () => {
  const response = await fetch(import.meta.env.VITE_BACKEND_HTTP_ADDRESS + '/cookies', {
    method: 'GET',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
  let cookies = (await response.json())
  if ("token" in cookies) {
    // @ts-ignore
    socketStore.yourUsername = useJwt(cookies.token).payload?.value.username || ''
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
