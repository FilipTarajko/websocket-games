<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useColorMode } from '@vueuse/core'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'

const mode = useColorMode()

function changeTheme() {
  if (mode.value == "light") {
    mode.value = "dark"
  }
  else {
    mode.value = "light"
  }
}
</script>

<template>
  <div class="p-4">
    <header class="flex justify-between">
      <a href="/">ws-games</a>
      <Button variant="outline" @click="changeTheme">
        <Icon v-if="mode == 'dark'" icon="radix-icons:moon" class="h-[1.2rem] w-[1.2rem]" />
        <Icon v-if="mode == 'light'" icon="radix-icons:sun" class="h-[1.2rem] w-[1.2rem]" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </header>

    <RouterView />
  </div>
</template>