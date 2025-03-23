<template>
  <div class="admin-container">
    <div class="user-info-card">
      <h2>学校管理员信息</h2>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户ID">{{ userInfo.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ userInfo.userName }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ userInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ userInfo.phone }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ userInfo.sex }}</el-descriptions-item>
        <el-descriptions-item label="所属学院">{{ userInfo.collegeName }}</el-descriptions-item>
        <el-descriptions-item label="用户级别">学校管理员</el-descriptions-item>
      </el-descriptions>

      <div class="actions">
        <el-button type="primary" @click="handleLogout">退出登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

document.title = '宿舍管理系统 - 管理员'

const router = useRouter()
const userInfo = ref({})

onMounted(() => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    userInfo.value = JSON.parse(storedUserInfo)
    // 验证用户类型
    if (userInfo.value.userType !== '1') {
      ElMessage.error('无权访问该页面')
      router.push('/login')
    }
  } else {
    ElMessage.error('用户信息不存在')
    router.push('/login')
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  router.push('/login')
  ElMessage.success('已退出登录')
}
</script>

<style lang="scss" scoped>
.admin-container {
  padding: 20px;
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: flex-start;

  .user-info-card {
    margin-top: 40px;
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    width: 100%;
    max-width: 800px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    h2 {
      margin-bottom: 24px;
      color: #1890ff;
      font-size: 24px;
      text-align: center;
    }

    .actions {
      margin-top: 24px;
      text-align: center;
    }
  }
}
</style> 