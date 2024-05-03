import { createRouter, createWebHistory } from 'vue-router'
import { useSocketStore } from '@/stores/socketStore'
import { useJwt } from '@vueuse/integrations/useJwt'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue')
    },
    {
      path: '/wait',
      name: 'wait',
      component: () => import('../views/WaitView.vue')
    }
  ]
})

router.afterEach(async (to, from) => {
  const socketStore = useSocketStore()
  try {
    let requestInit: any = {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    }
    if (to.name !== 'wait') {
      requestInit.signal = AbortSignal.timeout(2000)
    }
    const response = fetch(import.meta.env.VITE_BACKEND_HTTP_ADDRESS + '/cookies/', requestInit)
    let cookies = await (await response).json()
    if ('token' in cookies) {
      // @ts-ignore
      socketStore.yourUsername = useJwt(cookies.token).payload?.value.username || ''
      socketStore.setupSocket()
      if (to.name === 'wait') {
        router.push('/')
      }
    } else {
      socketStore.yourUsername = ''
      if (to.name !== 'auth') {
        router.push('/auth')
      }
    }
  } catch (e: any) {
    if (to.name != 'wait') {
      router.push('/wait')
      return true
    }
  }
})

export default router
