<script setup lang="ts">
import RoomsList from '@/components/RoomsList.vue';
import RoomComponent from '@/components/RoomComponent.vue';
</script>

<template>
  <h1 class="text-2xl mt-16">Rooms</h1>
  <RoomsList></RoomsList>
  <h1 class="text-2xl mt-16">Current room</h1>
  <RoomComponent></RoomComponent>
</template>
