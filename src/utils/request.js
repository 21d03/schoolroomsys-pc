import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      if (res.code === 401) {
        // token过期，重新登录
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      return Promise.reject(res)
    }
    return res
  },
  error => {
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default service 