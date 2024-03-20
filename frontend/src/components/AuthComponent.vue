<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { computed, ref } from 'vue'
// @ts-ignore
import { useJwt } from '@vueuse/integrations/useJwt'

const username = ref('test')
const password = ref('test')

const yourUsername = ref('')

async function register() {
  const response = await fetch('http://127.0.0.1:8000/register', {
    method: 'POST',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'

    },
    body: JSON.stringify({ username: username.value, password: password.value })
  })
  console.log((await response.json()))
}

async function logout() {
  const response = await fetch('http://127.0.0.1:8000/logout', {
    method: 'POST',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ username: username.value, password: password.value })
  });
  console.log((await response.json()))
  cookies()
}

async function login() {
  const response = await fetch('http://127.0.0.1:8000/login', {
    method: 'POST',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ username: username.value, password: password.value })
  })
  console.log((await response.json()))
  cookies()
}

async function me() {
  const response = await fetch('http://127.0.0.1:8000/me', {
    method: 'GET',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
  console.log((await response.json()))
}

async function cookies() {
  const response = await fetch('http://127.0.0.1:8000/cookies', {
    method: 'GET',
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  })
  let x = (await response.json())
  // console.log(JSON.parse(x))
  // console.log(x)
  if (x.token) {
    yourUsername.value = useJwt(x.token).payload?.value.username || ''
  } else {
    yourUsername.value = ''
  }
}

const loggedIn = computed(() => {
  return yourUsername.value !== ''
})

cookies()
</script>

<template>
  <div style="color: green;" v-if="yourUsername">
    your name: {{ yourUsername }}
  </div>
  <div style="color: red;" v-else>
    you are not logged in
  </div>
  <div class="flex flex-col gap-2">
    <Input :disabled="loggedIn" name="username input" v-model="username" placeholder="username" />
    <Input :disabled="loggedIn" name="password input" v-model="password" type="password" placeholder="password" />
    <div class="flex flex-row gap-2">
      <Button :disabled="loggedIn" @click="() => { register() }">register</Button>
      <Button :disabled="loggedIn" @click="() => { login() }">login</Button>
      <Button :disabled="!loggedIn" @click="() => { logout() }">logout</Button>
      <Button :disabled="!loggedIn" @click="() => { me() }">me</Button>
      <Button @click="() => { cookies() }">cookies</Button>
    </div>
  </div>
</template>
