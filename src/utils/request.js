import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service = axios.create({
  baseURL: '/SchoolRoomSys',  // 添加基础路径
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 后端返回的成功状态码是0
    if (res.code === 0) {
      return res
    }
    
    // 处理错误情况
    ElMessage.error(res.msg || '系统错误')
    return Promise.reject(new Error(res.msg || '系统错误'))
  },
  error => {
    console.error('响应错误:', error)
    ElMessage.error(error.response?.data?.msg || '请求失败，请稍后重试')
    return Promise.reject(error)
  }
)

export default service 