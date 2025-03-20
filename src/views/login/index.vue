<template>
  <div class="login-container">
    <!-- 左侧信息区 -->
    <div class="login-left">
      <div class="left-content">
        <div class="title-group">
          <div class="main-title">商丘师范学院</div>
          <div class="sub-title">宿舍管理系统</div>
        </div>
      </div>
      <div class="decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>

    <!-- 右侧登录区 -->
    <div class="login-right">
      <div class="login-box">
        <div class="welcome">
          <h2>欢迎登录</h2>
          <p>请选择您的身份进行登录</p>
        </div>

        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
          <!-- 用户类型选择 -->
          <div class="user-type-group">
            <div
              v-for="type in userTypes"
              :key="type.value"
              class="type-item"
              :class="{ active: loginForm.userType === type.value }"
              @click="handleTypeSelect(type.value)"
            >
              <el-icon class="type-icon">
                <component :is="type.icon" />
              </el-icon>
              <span>{{ type.label }}</span>
            </div>
          </div>

          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              :placeholder="getPlaceholder"
              :prefix-icon="User"
            />
          </el-form-item>

          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              :prefix-icon="Lock"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <!-- 记住密码 -->
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
          </div>

          <!-- 登录按钮 -->
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            立即登录
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, School, Notebook, Avatar } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const loginFormRef = ref()

// 用户类型
const userTypes = [
  { label: '学校管理员', value: 'admin', icon: 'School' },
  { label: '学院教师', value: 'teacher', icon: 'Notebook' },
  { label: '学生', value: 'student', icon: 'Avatar' }
]

// 表单数据
const loginForm = reactive({
  userType: 'admin',
  username: '',
  password: '',
  remember: false
})

// 根据用户类型显示不同的placeholder
const getPlaceholder = computed(() => {
  const typeMap = {
    admin: '请输入管理员账号',
    teacher: '请输入教师工号',
    student: '请输入学号'
  }
  return typeMap[loginForm.userType]
})

// 表单验证规则
const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 选择用户类型
const handleTypeSelect = (type) => {
  loginForm.userType = type
  loginForm.username = ''
  loginForm.password = ''
}

// 登录处理
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
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  // 左侧区域
  .login-left {
    position: relative;
    width: 55%;
    background: linear-gradient(135deg, #1890ff 0%, #1d39c4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    .left-content {
      position: relative;
      z-index: 1;
      width: 100%;
      text-align: center;

      .title-group {
        .main-title {
          font-size: 64px;
          font-weight: bold;
          color: #fff;
          margin-bottom: 24px;
          letter-spacing: 4px;
        }

        .sub-title {
          font-size: 36px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          letter-spacing: 2px;
        }
      }
    }

    .decoration {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;

      .circle {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);

        &.circle-1 {
          width: 300px;
          height: 300px;
          top: -100px;
          right: -100px;
        }

        &.circle-2 {
          width: 200px;
          height: 200px;
          bottom: 10%;
          left: -50px;
        }

        &.circle-3 {
          width: 150px;
          height: 150px;
          bottom: 50%;
          right: 20%;
          background: rgba(255, 255, 255, 0.05);
        }
      }
    }
  }

  // 右侧区域
  .login-right {
    flex: 1;
    background: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;

    .login-box {
      width: 400px;
      padding: 40px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.06);

      .welcome {
        text-align: center;
        margin-bottom: 40px;

        h2 {
          font-size: 28px;
          color: #1890ff;
          margin-bottom: 8px;
        }

        p {
          color: #909399;
          font-size: 14px;
        }
      }

      .user-type-group {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;

        .type-item {
          flex: 1;
          height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid #e4e7ed;
          background: #fff;

          &:hover {
            border-color: #1890ff;
            color: #1890ff;
            transform: translateY(-2px);
          }

          &.active {
            background: #e6f7ff;
            border-color: #1890ff;
            color: #1890ff;
            box-shadow: 0 2px 12px rgba(24, 144, 255, 0.1);
          }

          .type-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }

          span {
            font-size: 14px;
          }
        }
      }

      .login-options {
        display: flex;
        margin: 24px 0;
      }

      .login-button {
        width: 100%;
        height: 44px;
        font-size: 16px;
        font-weight: 500;
        letter-spacing: 2px;
        background: linear-gradient(45deg, #1890ff, #1d39c4);
        border: none;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}

// 响应式处理
@media screen and (max-width: 1200px) {
  .login-container {
    .login-left {
      .left-content {
        .title-group {
          .main-title {
            font-size: 56px;
          }
          
          .sub-title {
            font-size: 32px;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 992px) {
  .login-container {
    .login-left {
      .left-content {
        .title-group {
          .main-title {
            font-size: 48px;
          }
          
          .sub-title {
            font-size: 28px;
          }
        }
      }
    }
  }
}
</style> 