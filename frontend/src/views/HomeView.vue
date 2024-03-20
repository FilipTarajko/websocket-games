<script setup lang="ts">
import AuthComponent from '@/components/AuthComponent.vue'
import RoomsList from '@/components/RoomsList.vue';
import RoomComponent from '@/components/RoomComponent.vue';
</script>

<template>
  <h1 class="text-2xl mt-8">Auth</h1>
  <AuthComponent></AuthComponent>
  <h1 class="text-2xl mt-16">Rooms</h1>
  <RoomsList></RoomsList>
  <h1 class="text-2xl mt-16">Current room</h1>
  <RoomComponent></RoomComponent>
</template>
