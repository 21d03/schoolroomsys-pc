import { createRouter, createWebHistory } from 'vue-router'
import { adminRoutes } from './admin'
import Login from '@/views/login/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    adminRoutes
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

  if (to.path === '/login') {
    next()
    return
  }

  if (!token) {
    next('/login')
    return
  }

  // 检查用户类型和路由权限
  const userType = userInfo.userType
  const path = to.path

  if (path.startsWith('/admin') && userType !== '1') {
    next('/login')
    return
  }

  if (path.startsWith('/teacher') && userType !== '2') {
    next('/login')
    return
  }

  if (path.startsWith('/student') && userType !== '3') {
    next('/login')
    return
  }

  next()
})

// 设置页面标题
router.afterEach((to) => {
  document.title = '宿舍管理系统'
})

export default router
