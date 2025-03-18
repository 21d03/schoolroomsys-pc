<template>
  <div class="login-container">
    <div class="login-box">
      <h2>宿舍管理系统</h2>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="userType">
          <el-select v-model="loginForm.userType" placeholder="请选择用户类型" class="w-full">
            <el-option label="学校管理员" value="admin" />
            <el-option label="学院教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="w-full" :loading="loading" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref()

const loginForm = reactive({
  userType: 'admin',
  username: '',
  password: ''
})

const loginRules = {
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        const res = await request({
          url: '/api/login',
          method: 'post',
          data: loginForm
        })
        
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
        
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
  
  .login-box {
    width: 400px;
    padding: 40px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    
    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #409EFF;
    }
    
    .login-form {
      .w-full {
        width: 100%;
      }
    }
  }
}
</style> 