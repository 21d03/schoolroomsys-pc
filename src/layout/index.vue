<template>
  <div class="app-wrapper">
    <!-- 侧边栏 -->
    <div class="sidebar-container">
      <div class="logo">
        <h1>宿舍管理系统</h1>
      </div>
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <!-- 管理员菜单 -->
        <template v-if="userStore.isAdmin">
          <el-sub-menu index="dormitory">
            <template #title>
              <el-icon><House /></el-icon>
              <span>宿舍管理</span>
            </template>
            <el-menu-item index="/dormitory/building">宿舍楼管理</el-menu-item>
            <el-menu-item index="/dormitory/room">房间管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="personnel">
            <template #title>
              <el-icon><User /></el-icon>
              <span>人员管理</span>
            </template>
            <el-menu-item index="/personnel/student">学生管理</el-menu-item>
            <el-menu-item index="/personnel/teacher">教师管理</el-menu-item>
            <el-menu-item index="/personnel/dormManager">宿管管理</el-menu-item>
            <el-menu-item index="/personnel/repairman">维修人员管理</el-menu-item>
          </el-sub-menu>
        </template>

        <!-- 教师菜单 -->
        <template v-if="userStore.isTeacher">
          <el-menu-item index="/student-manage">
            <el-icon><User /></el-icon>
            <template #title>学生管理</template>
          </el-menu-item>
          <el-menu-item index="/leave-approval">
            <el-icon><Document /></el-icon>
            <template #title>请假审批</template>
          </el-menu-item>
        </template>

        <!-- 学生菜单 -->
        <template v-if="userStore.isStudent">
          <el-menu-item index="/my-info">
            <el-icon><User /></el-icon>
            <template #title>个人信息</template>
          </el-menu-item>
          <el-menu-item index="/leave-request">
            <el-icon><Document /></el-icon>
            <template #title>请假申请</template>
          </el-menu-item>
          <el-menu-item index="/repair-request">
            <el-icon><Tools /></el-icon>
            <template #title>报修申请</template>
          </el-menu-item>
        </template>
      </el-menu>
    </div>

    <!-- 主容器 -->
    <div class="main-container" :class="{ 'is-collapse': isCollapse }">
      <!-- 顶部导航栏 -->
      <div class="navbar">
        <div class="left">
          <el-icon class="fold-btn" @click="toggleSidebar">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="right">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-info">
              {{ userStore.userInfo.name }}
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
      </div>

      <!-- 内容区域 -->
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Odometer,
  House,
  User,
  Document,
  Tools,
  CaretBottom,
  Expand,
  Fold
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style lang="scss" scoped>
.app-wrapper {
  height: 100vh;
  display: flex;
  
  .sidebar-container {
    width: 210px;
    height: 100%;
    background-color: #304156;
    transition: width 0.3s;
    overflow: hidden;
    
    &.is-collapse {
      width: 64px;
    }
    
    .logo {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2b2f3a;
      
      h1 {
        color: #fff;
        font-size: 16px;
        margin: 0;
        white-space: nowrap;
      }
    }
    
    .el-menu {
      border: none;
      height: calc(100% - 50px);
    }
  }
  
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: margin-left 0.3s;
    
    &.is-collapse {
      margin-left: 64px;
    }
    
    .navbar {
      height: 50px;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
      
      .left {
        display: flex;
        align-items: center;
        
        .fold-btn {
          padding: 0 15px;
          cursor: pointer;
          font-size: 20px;
          
          &:hover {
            color: #409EFF;
          }
        }
      }
      
      .right {
        .user-info {
          cursor: pointer;
          display: flex;
          align-items: center;
          
          .el-icon {
            margin-left: 5px;
          }
        }
      }
    }
    
    .app-main {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      background: #f0f2f5;
    }
  }
}

// 路由切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 