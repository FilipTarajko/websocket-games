import { type Ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const accountStore = defineStore('accountStore', () => {
  const username: Ref<string> = useStorage('username', '')
  const password: Ref<string> = useStorage('password', '')

  async function register() {
    const response = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    console.log(response)
  }

  async function login() {
    const response = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    console.log(response)
  }

  async function me() {
    const response = await fetch('http://localhost:8000/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    console.log(response)
    const reader = response?.body?.getReader()
    if (reader) {
      const { value } = await reader.read()
      console.log(new TextDecoder().decode(value))
    }
  }

  return {
    login,
    register,
    me
  }
})
