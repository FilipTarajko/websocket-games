<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useColorMode } from '@vueuse/core'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import Toaster from '@/components/ui/toast/Toaster.vue'

const mode = useColorMode()

function changeTheme() {
  if (mode.value == 'light') {
    mode.value = 'dark'
  } else {
    mode.value = 'light'
  }
}
</script>

<template>
  <Toaster />
  <div class="p-4">
    <header class="flex justify-between">
      <RouterLink :to="{ name: 'home' }" tabindex="0">ws-games</RouterLink>
      <RouterLink :to="{ name: 'auth' }" tabindex="0">go to /auth</RouterLink>
      <Button variant="outline" @click="changeTheme">
        <Icon v-if="mode == 'dark'" icon="radix-icons:moon" class="h-[1.2rem] w-[1.2rem]" />
        <Icon v-if="mode == 'light'" icon="radix-icons:sun" class="h-[1.2rem] w-[1.2rem]" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </header>

    <RouterView />
  </div>
</template>
