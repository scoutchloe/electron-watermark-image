import { createRouter, createWebHashHistory } from 'vue-router'
import WatermarkEditor from '@/views/WatermarkEditor.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'WatermarkEditor',
      component: WatermarkEditor
    }
  ]
})

export default router 