<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="aside">
      <div class="logo">
        <h1>{{ isCollapse ? '宿' : '宿舍管理系统' }}</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        :collapse="isCollapse"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
        :router="true"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <el-sub-menu index="dormitory">
          <template #title>
            <el-icon><House /></el-icon>
            <span>宿舍管理</span>
          </template>
          <el-menu-item index="/admin/dormitory/building">宿舍楼管理</el-menu-item>
          <el-menu-item index="/admin/dormitory/room">房间管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="personnel">
          <template #title>
            <el-icon><User /></el-icon>
            <span>人员管理</span>
          </template>
          <el-menu-item index="/admin/personnel/student">学生管理</el-menu-item>
          <el-menu-item index="/admin/personnel/teacher">教师管理</el-menu-item>
          <el-menu-item index="/admin/personnel/dorm-manager">宿管管理</el-menu-item>
          <el-menu-item index="/admin/personnel/maintenance">维修人员管理</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/admin/approval">
          <el-icon><Document /></el-icon>
          <span>审批管理</span>
        </el-menu-item>

        <el-sub-menu index="statistics">
          <template #title>
            <el-icon><PieChart /></el-icon>
            <span>数据统计</span>
          </template>
          <el-menu-item index="/admin/statistics/resource">宿舍资源分析</el-menu-item>
          <el-menu-item index="/admin/statistics/distribution">人员分布统计</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="settings">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/admin/settings/permission">权限配置</el-menu-item>
          <el-menu-item index="/admin/settings/college">学院/班级管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 主要内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon 
            class="fold-icon" 
            @click="toggleSidebar"
          >
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-info">
              {{ userInfo.name }}
              <el-icon><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>

    <!-- 个人信息弹窗 -->
    <el-dialog
      v-model="showProfileDialog"
      title="个人信息"
      width="400px"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      destroy-on-close
    >
      <div class="profile-info">
        <div class="info-item">
          <span class="label">用户ID：</span>
          <span class="value">{{ userInfo.userId }}</span>
        </div>
        <div class="info-item">
          <span class="label">用户名：</span>
          <span class="value">{{ userInfo.userName }}</span>
        </div>
        <div class="info-item">
          <span class="label">姓名：</span>
          <span class="value">{{ userInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">用户类型：</span>
          <span class="value">{{ userTypeText }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Odometer,
  House,
  User,
  Document,
  PieChart,
  Setting,
  Expand,
  Fold,
  CaretBottom
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 获取用户信息
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

// 用户类型文本映射
const userTypeMap = {
  '1': '学校管理员',
  '2': '教师',
  '3': '学生'
}

// 计算用户类型显示文本
const userTypeText = computed(() => {
  return userTypeMap[userInfo.value.userType] || '未知'
})

// 控制个人信息弹窗显示
const showProfileDialog = ref(false)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 菜单折叠状态
const isCollapse = ref(false)

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/login')
      ElMessage.success('已退出登录')
    }).catch(() => {})
  } else if (command === 'profile') {
    showProfileDialog.value = true
  }
}
</script>

<style lang="scss" scoped>
.admin-layout {
  height: 100%;
  width: 100%;
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .aside {
    height: 100%;
    background-color: #001529;
    overflow-x: hidden;
    overflow-y: auto;
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .logo {
      height: 60px;
      line-height: 60px;
      text-align: center;
      color: #fff;
      font-size: 16px;
      border-bottom: 1px solid #002140;
      overflow: hidden;
      white-space: nowrap;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      h1 {
        color: #fff;
        font-size: 18px;
        margin: 0;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    .el-menu {
      border-right: none;
      height: calc(100% - 60px);
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :deep(.el-menu--collapse) {
      width: 64px;
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      .el-icon {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      span {
        transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    :deep(.el-sub-menu) {
      .el-menu-item {
        min-width: 200px;
      }
    }

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    .header {
      height: 60px;
      background: #fff;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      flex-shrink: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      .header-left {
        .fold-icon {
          font-size: 20px;
          cursor: pointer;
          color: #333;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            color: var(--el-color-primary);
            transform: scale(1.1);
          }
        }
      }

      .header-right {
        .user-info {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            color: var(--el-color-primary);
          }
        }
      }
    }

    .main {
      flex: 1;
      background: #f0f2f5;
      padding: 20px;
      overflow-y: auto;
      height: calc(100% - 60px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }
}

.profile-info {
  padding: 10px;

  .info-item {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    line-height: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      width: 80px;
      color: #606266;
      font-weight: 500;
    }

    .value {
      flex: 1;
      color: #333;
    }
  }
}

:deep(.el-dialog__body) {
  padding-top: 20px;
  padding-bottom: 20px;
}
</style> 