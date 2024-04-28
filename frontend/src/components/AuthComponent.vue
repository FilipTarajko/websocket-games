<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { computed, ref } from 'vue'
// @ts-ignore
import { useJwt } from '@vueuse/integrations/useJwt'
import { useSocketStore } from '@/stores/socketStore';
import { useToast } from '@/components/ui/toast/use-toast'
import Toaster from "@/components/ui/toast/Toaster.vue"
import router from '@/router';
const socketStore = useSocketStore()
const { toast } = useToast()

const username = ref('')
const password = ref('')

async function tryAsyncFunction(callback: Function, action: string) {
  try {
    let result = await callback()
    toast({description: result, variant: result.includes("Error") ? "destructive" : "default"});
  } catch (e) {
    toast({variant: "destructive", description: `error while trying to ${action}`})
  }
}

async function register() {
  const response = await fetch(import.meta.env.VITE_BACKEND_HTTP_ADDRESS + '/register/', {
    method: 'POST',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'

    },
    body: JSON.stringify({ username: username.value, password: password.value })
  })
  let result = response;
  if (result.status !== 201) {
    return "Error: "+await result.json();
  }
  setTimeout(() => {
    login();
  }, 500);
  return await result.json();
}

async function logout() {
  const response = await fetch(import.meta.env.VITE_BACKEND_HTTP_ADDRESS + '/logout/', {
    method: 'POST',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ username: username.value, password: password.value })
  });
  cookies()
  return 'logged out'
}

async function login() {
  const response = await fetch(import.meta.env.VITE_BACKEND_HTTP_ADDRESS + '/login/', {
    method: 'POST',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ username: username.value, password: password.value })
  })
  let result = response;
  if (result.status > 299) {
    return "Error: "+await result.json();
  }
  await cookies()
  socketStore.setupSocket();
  setTimeout(() => {
    router.push('/');
  }, 500)
  return "logged in!";
}

// async function me() {
//   const response = await fetch(import.meta.env.VITE_BACKEND_HTTP_ADDRESS + '/me/', {
//     method: 'GET',
//     credentials: "include",
//     headers: {
//       'Content-Type': 'application/json',
//       'Access-Control-Allow-Origin': '*'
//     }
//   })
//   console.log((await response.json()))
// }

async function cookies() {
  const response = await fetch(import.meta.env.VITE_BACKEND_HTTP_ADDRESS + '/cookies/', {
    method: 'GET',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
  let data = (await response.json())
  if (data.token) {
    // @ts-ignore
    socketStore.yourUsername = useJwt(data.token).payload?.value.username || ''
  } else {
    socketStore.yourUsername = ''
  }
}

const loggedIn = computed(() => {
  return socketStore.yourUsername !== ''
})

cookies()
</script>

<template>
  <div>
    <Toaster />
    <div style="color: green;" v-if="socketStore.yourUsername">
      your name: {{ socketStore.yourUsername }}
    </div>
    <div style="color: red;" v-else>
      you are not logged in
    </div>
    <div class="flex flex-col gap-2">
      <Input :disabled="loggedIn" name="username input" v-model="username" placeholder="username" />
      <Input :disabled="loggedIn" name="password input" v-model="password" type="password" placeholder="password" />
      <div class="flex flex-row gap-2">
        <Button :disabled="loggedIn" @click="() => { tryAsyncFunction(register, 'register') }">register</Button>
        <Button :disabled="loggedIn" @click="() => { tryAsyncFunction(login, 'log in') }">log in</Button>
        <Button :disabled="!loggedIn" @click="() => { tryAsyncFunction(logout, 'log out') }">log out</Button>
        <!-- debug -->
        <!-- <Button :disabled="!loggedIn" @click="() => { me() }">me</Button>
        <Button @click="() => { cookies() }">cookies</Button> -->
      </div>
    </div>
  </div>
</template>
