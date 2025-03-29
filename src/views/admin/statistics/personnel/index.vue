<template>
  <div class="personnel-distribution-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon student">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.studentCount }}</div>
              <div class="stat-title">学生总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon teacher">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.teacherCount }}</div>
              <div class="stat-title">教师总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon manager">
              <el-icon><Avatar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.managerCount }}</div>
              <div class="stat-title">宿管总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-card-content">
            <div class="stat-icon repair">
              <el-icon><Tools /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.repairmanCount }}</div>
              <div class="stat-title">维修人员总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-container">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>学院学生分布</span>
            </div>
          </template>
          <div class="chart" ref="collegeDistributionChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>班级学生分布</span>
            </div>
          </template>
          <div class="chart" ref="classDistributionChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-container">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>宿管与维修人员覆盖情况</span>
            </div>
          </template>
          <div class="chart" ref="staffCoverageChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { User, UserFilled, Avatar, Tools } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import request from '@/utils/request'

// 统计数据
const stats = reactive({
  studentCount: 0,
  teacherCount: 0,
  managerCount: 0,
  repairmanCount: 0
})

// 图表实例
let collegeDistributionChart = null
let classDistributionChart = null
let staffCoverageChart = null

// 图表DOM引用
const collegeDistributionChartRef = ref(null)
const classDistributionChartRef = ref(null)
const staffCoverageChartRef = ref(null)

// 初始化学院分布图表
const initCollegeDistributionChart = () => {
  collegeDistributionChart = echarts.init(collegeDistributionChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '学生人数',
        type: 'bar',
        data: []
      }
    ]
  }
  collegeDistributionChart.setOption(option)
}

// 初始化班级分布图表
const initClassDistributionChart = () => {
  classDistributionChart = echarts.init(classDistributionChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      type: 'scroll'
    },
    series: [
      {
        name: '班级分布',
        type: 'pie',
        radius: '50%',
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  classDistributionChart.setOption(option)
}

// 初始化人员覆盖图表
const initStaffCoverageChart = () => {
  staffCoverageChart = echarts.init(staffCoverageChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['宿管人数', '维修人员人数', '负责宿舍楼数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: [
      {
        type: 'value',
        name: '人数',
        position: 'left'
      },
      {
        type: 'value',
        name: '宿舍楼数',
        position: 'right'
      }
    ],
    series: [
      {
        name: '宿管人数',
        type: 'bar',
        data: []
      },
      {
        name: '维修人员人数',
        type: 'bar',
        data: []
      },
      {
        name: '负责宿舍楼数',
        type: 'line',
        yAxisIndex: 1,
        data: []
      }
    ]
  }
  staffCoverageChart.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  collegeDistributionChart?.resize()
  classDistributionChart?.resize()
  staffCoverageChart?.resize()
}

// 初始化所有图表
const initCharts = () => {
  initCollegeDistributionChart()
  initClassDistributionChart()
  initStaffCoverageChart()
}

// 页面加载时初始化
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

// 页面卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  collegeDistributionChart?.dispose()
  classDistributionChart?.dispose()
  staffCoverageChart?.dispose()
})
</script>

<style lang="scss" scoped>
.personnel-distribution-container {
  padding: 20px;

  .statistics-cards {
    margin-bottom: 20px;

    .stat-card {
      .stat-card-content {
        display: flex;
        align-items: center;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;

          .el-icon {
            font-size: 28px;
            color: white;
          }

          &.student {
            background-color: #409eff;
          }

          &.teacher {
            background-color: #67c23a;
          }

          &.manager {
            background-color: #e6a23c;
          }

          &.repair {
            background-color: #f56c6c;
          }
        }

        .stat-info {
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            line-height: 1.2;
          }

          .stat-title {
            color: #606266;
            font-size: 14px;
          }
        }
      }
    }
  }

  .chart-container {
    margin-bottom: 20px;

    .chart-card {
      .chart {
        height: 400px;
      }
    }
  }
}
</style>
