<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>宿舍楼总数</span>
              <el-icon><House /></el-icon>
            </div>
          </template>
          <div class="card-body">
            <span class="number">{{ stats.buildingCount || 0 }}</span>
            <span class="unit">栋</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>房间使用率</span>
              <el-icon><DataLine /></el-icon>
            </div>
          </template>
          <div class="card-body">
            <span class="number">{{ stats.roomUsageRate || 0 }}</span>
            <span class="unit">%</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>待处理报修</span>
              <el-icon><Tools /></el-icon>
            </div>
          </template>
          <div class="card-body">
            <span class="number">{{ stats.pendingRepairs || 0 }}</span>
            <span class="unit">件</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>待审批请假</span>
              <el-icon><Document /></el-icon>
            </div>
          </template>
          <div class="card-body">
            <span class="number">{{ stats.pendingLeaves || 0 }}</span>
            <span class="unit">条</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>宿舍楼入住情况</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- 这里将来放图表组件 -->
            <div class="placeholder">宿舍楼入住率统计图表</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>报修类型分布</span>
            </div>
          </template>
          <div class="chart-container">
            <!-- 这里将来放图表组件 -->
            <div class="placeholder">报修类型饼图</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近动态 -->
    <el-card shadow="hover" class="activity-card">
      <template #header>
        <div class="card-header">
          <span>最近动态</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in recentActivities"
          :key="index"
          :timestamp="activity.time"
          :type="activity.type"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { House, DataLine, Tools, Document } from '@element-plus/icons-vue'
import request from '@/utils/request'

// 统计数据
const stats = ref({
  buildingCount: 0,
  roomUsageRate: 0,
  pendingRepairs: 0,
  pendingLeaves: 0
})

// 最近动态数据
const recentActivities = ref([
  {
    content: '张三提交了请假申请',
    time: '2024-03-18 10:00',
    type: 'primary'
  },
  {
    content: '1号楼102房间报修已处理完成',
    time: '2024-03-18 09:30',
    type: 'success'
  },
  {
    content: '新增学生宿舍分配：李四 - 2号楼304室',
    time: '2024-03-18 09:00',
    type: 'info'
  }
])

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await request({
      url: '/api/dashboard/stats',
      method: 'get'
    })
    stats.value = res.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  .stat-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .el-icon {
        font-size: 20px;
        color: #409EFF;
      }
    }
    
    .card-body {
      text-align: center;
      padding: 10px 0;
      
      .number {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }
      
      .unit {
        font-size: 14px;
        color: #909399;
        margin-left: 5px;
      }
    }
  }
  
  .chart-row {
    margin-top: 20px;
    
    .chart-container {
      height: 300px;
      
      .placeholder {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #909399;
        background: #f5f7fa;
        border-radius: 4px;
      }
    }
  }
  
  .activity-card {
    margin-top: 20px;
  }
}
</style> 