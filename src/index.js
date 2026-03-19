
import { createRouter, createWebHistory } from 'vue-router'
import Index from './Index.vue'
import Hello from './Hello.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/hello/:name?',  
      name: 'Hello',
      component: Hello,
      props: true  
    }
  ]
})

export default router