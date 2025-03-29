<template>
  <div class="dormitory-resource-analysis">
    <el-card shadow="never" class="analysis-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">宿舍资源总览</span>
          <el-button type="primary" @click="refreshData">刷新数据</el-button>
        </div>
      </template>
      <div class="stat-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-card-content">
                <div class="stat-icon building">
                  <el-icon><House /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ overviewData.buildingCount || 0 }}</div>
                  <div class="stat-title">宿舍楼总数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-card-content">
                <div class="stat-icon room">
                  <el-icon><HomeFilled /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ overviewData.roomCount || 0 }}</div>
                  <div class="stat-title">房间总数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-card-content">
                <div class="stat-icon bed">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ overviewData.bedCount || 0 }}</div>
                  <div class="stat-title">床位总数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-card-content">
                <div class="stat-icon usage">
                  <el-icon><DataAnalysis /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ overviewData.usageRate || 0 }}%</div>
                  <div class="stat-title">使用率</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">各宿舍楼房间分布</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loadingRoomDistribution">
            <div ref="roomDistributionChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">各宿舍楼使用率</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loadingUsageRate">
            <div ref="usageRateChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">房间类型分布</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loadingRoomType">
            <div ref="roomTypeChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">男女宿舍比例</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loadingGenderRatio">
            <div ref="genderRatioChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { House, HomeFilled, User, DataAnalysis } from '@element-plus/icons-vue'
import request from '@/utils/request'
import * as echarts from 'echarts'

// 图表实例
let roomDistributionChartInstance = null
let usageRateChartInstance = null
let roomTypeChartInstance = null
let genderRatioChartInstance = null

// 加载状态
const loadingRoomDistribution = ref(false)
const loadingUsageRate = ref(false)
const loadingRoomType = ref(false)
const loadingGenderRatio = ref(false)

// 图表DOM引用
const roomDistributionChart = ref(null)
const usageRateChart = ref(null)
const roomTypeChart = ref(null)
const genderRatioChart = ref(null)

// 概览数据
const overviewData = reactive({
  buildingCount: 0,
  roomCount: 0,
  bedCount: 0,
  usageRate: 0
})

// 获取资源总览数据
const getResourceOverview = async () => {
  try {
    const res = await request.get('/school/dorm/overview')
    const { code, msg, data } = res.data
    if (code === 0) {
      overviewData.buildingCount = data.buildingCount || 0
      overviewData.roomCount = data.roomCount || 0
      overviewData.bedCount = data.bedCount || 0
      overviewData.usageRate = ((data.usageRate || 0) * 100).toFixed(2)
    } else {
      ElMessage.error(res.msg || '获取资源总览数据失败')
    }
  } catch (error) {
    console.error('获取资源总览数据失败:', error)
    ElMessage.error('获取资源总览数据失败，请稍后重试')
  }
}

// 获取房间分布数据
const getRoomDistribution = async () => {
  loadingRoomDistribution.value = true
  try {
    const res = await request.get('/school/dorm/building/room-distribution')
    const { code, msg, data } = res.data
    if (code === 0) {
      renderRoomDistributionChart(data)
    } else {
      ElMessage.error(msg || '获取房间分布数据失败')
    }
  } catch (error) {
    console.error('获取房间分布数据失败:', error)
    ElMessage.error('获取房间分布数据失败，请稍后重试')
  } finally {
    loadingRoomDistribution.value = false
  }
}

// 获取使用率数据
const getUsageRate = async () => {
  loadingUsageRate.value = true
  try {
    const res = await request.get('/school/dorm/building/usage-rate')
    const { code, msg, data } = res.data
    if (code === 0) {
      renderUsageRateChart(data)
    } else {
      ElMessage.error(msg || '获取使用率数据失败')
    }
  } catch (error) {
    console.error('获取使用率数据失败:', error)
    ElMessage.error('获取使用率数据失败，请稍后重试')
  } finally {
    loadingUsageRate.value = false
  }
}

// 获取房间类型分布
const getRoomTypeDistribution = async () => {
  loadingRoomType.value = true
  try {
    const res = await request.get('/school/dormitory/resource/room-type')
    const { code, msg, data } = res
    if (code === 0) {
      renderRoomTypeChart(data)
    } else {
      ElMessage.error(msg || '获取房间类型数据失败')
    }
  } catch (error) {
    console.error('获取房间类型数据失败:', error)
    ElMessage.error('获取房间类型数据失败，请稍后重试')
  } finally {
    loadingRoomType.value = false
  }
}

// 获取男女宿舍比例
const getGenderRatio = async () => {
  loadingGenderRatio.value = true
  try {
    const res = await request.get('/school/dormitory/resource/gender-ratio')
    const { code, msg, data } = res
    if (code === 0) {
      renderGenderRatioChart(data)
    } else {
      ElMessage.error(msg || '获取男女宿舍比例数据失败')
    }
  } catch (error) {
    console.error('获取男女宿舍比例数据失败:', error)
    ElMessage.error('获取男女宿舍比例数据失败，请稍后重试')
  } finally {
    loadingGenderRatio.value = false
  }
}

// 渲染各宿舍楼房间分布图表
const renderRoomDistributionChart = (data) => {
  if (!roomDistributionChartInstance) {
    roomDistributionChartInstance = echarts.init(roomDistributionChart.value)
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        // 构建自定义提示框内容
        let res = `<div style="font-weight:bold;margin-bottom:5px;">${params[0].name}</div>`
        params.forEach(param => {
          const colorSpan = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${param.color};"></span>`
          res += `${colorSpan} ${param.seriesName}: ${param.value}<br/>`
        })
        return res
      }
    },
    legend: {
      data: ['总房间数', '已使用', '空闲', '维修中'],
      textStyle: {
        fontSize: 12
      },
      itemWidth: 15,
      itemHeight: 10,
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.buildingName),
      axisLabel: {
        interval: 0,
        rotate: data.length > 5 ? 30 : 0, // 如果宿舍楼数量超过5个，旋转标签以防重叠
        fontSize: 12
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: '房间数量',
      nameTextStyle: {
        padding: [0, 0, 0, 30]
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '总房间数',
        type: 'bar',
        barWidth: data.length > 5 ? '40%' : '60%', // 根据数据量调整柱宽
        itemStyle: {
          color: '#91cc75',
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.2)'
          }
        },
        data: data.map(item => item.totalRooms),
        label: {
          show: true,
          position: 'top',
          fontSize: 12
        },
        z: 1
      },
      {
        name: '已使用',
        type: 'bar',
        stack: 'usage',
        itemStyle: {
          color: '#5470c6'
        },
        emphasis: {
          focus: 'series'
        },
        data: data.map(item => item.usedRooms),
        z: 2
      },
      {
        name: '空闲',
        type: 'bar',
        stack: 'usage',
        itemStyle: {
          color: '#91cc75'
        },
        emphasis: {
          focus: 'series'
        },
        data: data.map(item => item.availableRooms),
        z: 2
      },
      {
        name: '维修中',
        type: 'bar',
        stack: 'usage',
        itemStyle: {
          color: '#ee6666',
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          focus: 'series'
        },
        data: data.map(item => item.underMaintenanceRooms),
        z: 2
      }
    ]
  }
  
  roomDistributionChartInstance.setOption(option)
}

// 渲染各宿舍楼使用率图表
const renderUsageRateChart = (data) => {
  if (!usageRateChartInstance) {
    usageRateChartInstance = echarts.init(usageRateChart.value)
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.buildingName),
      axisLabel: {
        interval: 0,
        rotate: data.length > 5 ? 30 : 0,
        fontSize: 12
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: '使用率(%)',
      nameTextStyle: {
        padding: [0, 0, 0, 30],
        fontSize: 14
      },
      axisLabel: {
        formatter: '{value}%',
        fontSize: 12
      },
      max: 100,
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '使用率',
        type: 'bar',
        barWidth: data.length > 6 ? '40%' : '60%',
        data: data.map(item => (item.usageRate * 100).toFixed(2)),
        itemStyle: {
          color: function(params) {
            // 根据使用率设置不同颜色
            const value = params.value
            if (value < 60) return '#91cc75' // 绿色，使用率低
            if (value < 80) return '#fac858' // 黄色，使用率中等
            return '#ee6666' // 红色，使用率高
          },
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 12
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.2)'
          }
        }
      }
    ]
  }
  
  usageRateChartInstance.setOption(option)
}

// 渲染房间类型分布图表
const renderRoomTypeChart = (data) => {
  if (!roomTypeChartInstance) {
    roomTypeChartInstance = echarts.init(roomTypeChart.value)
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    series: [
      {
        name: '房间类型',
        type: 'pie',
        radius: '60%',
        center: ['60%', '50%'],
        data: data.map(item => ({
          name: item.typeName,
          value: item.count
        })),
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)',
          fontSize: 14
        },
        labelLine: {
          show: true
        },
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
  
  roomTypeChartInstance.setOption(option)
}

// 渲染男女宿舍比例图表
const renderGenderRatioChart = (data) => {
  if (!genderRatioChartInstance) {
    genderRatioChartInstance = echarts.init(genderRatioChart.value)
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    series: [
      {
        name: '性别比例',
        type: 'pie',
        radius: ['30%', '60%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)',
          fontSize: 14,
          position: 'outside'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10
        },
        data: [
          { 
            value: data.maleCount, 
            name: '男生宿舍',
            itemStyle: { color: '#5470c6' }
          },
          { 
            value: data.femaleCount, 
            name: '女生宿舍',
            itemStyle: { color: '#ee6666' }
          },
          { 
            value: data.mixedCount, 
            name: '混合宿舍',
            itemStyle: { color: '#91cc75' }
          }
        ]
      }
    ]
  }
  
  genderRatioChartInstance.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  roomDistributionChartInstance?.resize()
  usageRateChartInstance?.resize()
  roomTypeChartInstance?.resize()
  genderRatioChartInstance?.resize()
}

// 刷新所有数据
const refreshData = () => {
  getResourceOverview()
  getRoomDistribution()
  getUsageRate()
  getRoomTypeDistribution()
  getGenderRatio()
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    // 初始化图表
    if (roomDistributionChart.value) {
      roomDistributionChartInstance = echarts.init(roomDistributionChart.value)
    }
    if (usageRateChart.value) {
      usageRateChartInstance = echarts.init(usageRateChart.value)
    }
    if (roomTypeChart.value) {
      roomTypeChartInstance = echarts.init(roomTypeChart.value)
    }
    if (genderRatioChart.value) {
      genderRatioChartInstance = echarts.init(genderRatioChart.value)
    }
    
    // 获取数据并渲染图表
    refreshData()
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize)
  })
}

// 组件卸载时清理
const cleanupCharts = () => {
  roomDistributionChartInstance?.dispose()
  usageRateChartInstance?.dispose()
  roomTypeChartInstance?.dispose()
  genderRatioChartInstance?.dispose()
  
  window.removeEventListener('resize', handleResize)
}

// 生命周期钩子
onMounted(() => {
  initCharts()
})

onBeforeUnmount(() => {
  cleanupCharts()
})
</script>

<style lang="scss" scoped>
.dormitory-resource-analysis {
  .analysis-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-title {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
  
  .stat-cards {
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
          
          &.building {
            background-color: #409eff;
          }
          
          &.room {
            background-color: #67c23a;
          }
          
          &.bed {
            background-color: #e6a23c;
          }
          
          &.usage {
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
  
  .chart-row {
    margin-bottom: 20px;
    
    .chart-card {
      height: 450px;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .header-title {
          font-size: 16px;
          font-weight: 600;
        }
      }
      
      .chart-container {
        height: 380px;
        width: 100%;
        
        .chart {
          height: 100%;
          width: 100%;
        }
      }
    }
  }
}
</style>
