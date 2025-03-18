import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
  }),
  
  getters: {
    isAdmin: (state) => state.userInfo.userType === 'admin',
    isTeacher: (state) => state.userInfo.userType === 'teacher',
    isStudent: (state) => state.userInfo.userType === 'student'
  },
  
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },
    
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    
    async login(loginForm) {
      const res = await request({
        url: '/api/login',
        method: 'post',
        data: loginForm
      })
      
      this.setToken(res.data.token)
      this.setUserInfo(res.data.userInfo)
      return res
    },
    
    logout() {
      this.token = ''
      this.userInfo = {}
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
}) 