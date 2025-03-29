<template>
  <div class="personnel-distribution-analysis">
    <el-card shadow="never" class="analysis-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">人员分布总览</span>
          <el-button type="primary" @click="refreshData">刷新数据</el-button>
        </div>
      </template>
      <div class="stat-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-card-content">
                <div class="stat-icon student">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ overviewData.studentCount || 0 }}</div>
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
                  <div class="stat-value">{{ overviewData.teacherCount || 0 }}</div>
                  <div class="stat-title">教师总数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-card-content">
                <div class="stat-icon dormManager">
                  <el-icon><Avatar /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ overviewData.dormManagerCount || 0 }}</div>
                  <div class="stat-title">宿管人数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-card-content">
                <div class="stat-icon maintenance">
                  <el-icon><Tools /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ overviewData.maintenanceCount || 0 }}</div>
                  <div class="stat-title">维修人员数</div>
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
              <span class="header-title">各学院学生分布</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loadingCollegeDistribution">
            <div ref="collegeDistributionChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">男女学生比例</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loadingStudentGenderRatio">
            <div ref="studentGenderRatioChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">班级人数分布</span>
              <el-select 
                v-model="selectedCollege" 
                placeholder="请选择学院" 
                clearable 
                @change="getClassDistribution"
                style="width: 200px;"
              >
                <el-option 
                  v-for="item in collegeOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                />
              </el-select>
            </div>
          </template>
          <div class="chart-container" v-loading="loadingClassDistribution">
            <div ref="classDistributionChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">人员覆盖率</span>
            </div>
          </template>
          <div class="chart-container" v-loading="loadingCoverageRate">
            <div ref="coverageRateChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { User, UserFilled, Avatar, Tools } from '@element-plus/icons-vue'
import request from '@/utils/request'
import * as echarts from 'echarts'

// 图表实例
let collegeDistributionChartInstance = null
let studentGenderRatioChartInstance = null
let classDistributionChartInstance = null
let coverageRateChartInstance = null

// 加载状态
const loadingCollegeDistribution = ref(false)
const loadingStudentGenderRatio = ref(false)
const loadingClassDistribution = ref(false)
const loadingCoverageRate = ref(false)

// 图表DOM引用
const collegeDistributionChart = ref(null)
const studentGenderRatioChart = ref(null)
const classDistributionChart = ref(null)
const coverageRateChart = ref(null)

// 学院选择
const selectedCollege = ref('')
const collegeOptions = ref([])

// 概览数据
const overviewData = reactive({
  studentCount: 0,
  teacherCount: 0,
  dormManagerCount: 0,
  maintenanceCount: 0
})

// 获取人员总览数据
const getPersonnelOverview = async () => {
  try {
    const res = await request.get('/school/personnel/overview')
    const { code, msg, data } = res.data
    if (code === 0) {
      overviewData.studentCount = data.studentCount || 0
      overviewData.teacherCount = data.teacherCount || 0
      overviewData.dormManagerCount = data.dormManagerCount || 0
      overviewData.maintenanceCount = data.maintenanceCount || 0
    } else {
      ElMessage.error(res.msg || '获取人员总览数据失败')
    }
  } catch (error) {
    console.error('获取人员总览数据失败:', error)
    ElMessage.error('获取人员总览数据失败，请稍后重试')
  }
}

// 获取学院列表
const getCollegeList = async () => {
  try {
    const res = await request.get('/school/personnel/college/list')
    if (res.code === 0) {
      collegeOptions.value = res.data.map(item => ({
        label: item.collegeName,
        value: item.collegeId
      }))
    } else {
      ElMessage.error(res.msg || '获取学院列表失败')
    }
  } catch (error) {
    console.error('获取学院列表失败:', error)
    ElMessage.error('获取学院列表失败，请稍后重试')
  }
}

// 获取各学院学生分布
const getCollegeDistribution = async () => {
  loadingCollegeDistribution.value = true
  try {
    const res = await request.get('/school/personnel/college/student-distribution')
    if (res.code === 0) {
      renderCollegeDistributionChart(res.data)
    } else {
      ElMessage.error(res.msg || '获取学院分布数据失败')
    }
  } catch (error) {
    console.error('获取学院分布数据失败:', error)
    ElMessage.error('获取学院分布数据失败，请稍后重试')
  } finally {
    loadingCollegeDistribution.value = false
  }
}

// 获取男女学生比例
const getStudentGenderRatio = async () => {
  loadingStudentGenderRatio.value = true
  try {
    const res = await request.get('/school/personnel/student/gender-ratio')
    if (res.code === 0) {
      renderStudentGenderRatioChart(res.data)
    } else {
      ElMessage.error(res.msg || '获取学生性别比例数据失败')
    }
  } catch (error) {
    console.error('获取学生性别比例数据失败:', error)
    ElMessage.error('获取学生性别比例数据失败，请稍后重试')
  } finally {
    loadingStudentGenderRatio.value = false
  }
}

// 获取班级人数分布
const getClassDistribution = async () => {
  loadingClassDistribution.value = true
  try {
    const params = selectedCollege.value ? { collegeId: selectedCollege.value } : {}
    const res = await request.get('/school/personnel/class/distribution', { params })
    if (res.code === 0) {
      renderClassDistributionChart(res.data)
    } else {
      ElMessage.error(res.msg || '获取班级分布数据失败')
    }
  } catch (error) {
    console.error('获取班级分布数据失败:', error)
    ElMessage.error('获取班级分布数据失败，请稍后重试')
  } finally {
    loadingClassDistribution.value = false
  }
}

// 获取人员覆盖率
const getCoverageRate = async () => {
  loadingCoverageRate.value = true
  try {
    const res = await request.get('/school/personnel/coverage-rate')
    if (res.code === 0) {
      renderCoverageRateChart(res.data)
    } else {
      ElMessage.error(res.msg || '获取人员覆盖率数据失败')
    }
  } catch (error) {
    console.error('获取人员覆盖率数据失败:', error)
    ElMessage.error('获取人员覆盖率数据失败，请稍后重试')
  } finally {
    loadingCoverageRate.value = false
  }
}

// 渲染各学院学生分布图表
const renderCollegeDistributionChart = (data) => {
  if (!collegeDistributionChartInstance) {
    collegeDistributionChartInstance = echarts.init(collegeDistributionChart.value)
  }
  
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
      bottom: '12%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.collegeName),
      axisLabel: {
        interval: 0,
        rotate: data.length > 5 ? 30 : 0,
        fontSize: 14
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: '学生数量',
      nameTextStyle: {
        padding: [0, 0, 0, 40],
        fontSize: 14
      },
      axisLabel: {
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '学生数量',
        type: 'bar',
        barWidth: data.length > 5 ? '40%' : '60%',
        itemStyle: {
          color: '#5470c6',
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.2)'
          }
        },
        data: data.map(item => item.studentCount),
        label: {
          show: true,
          position: 'top',
          fontSize: 14
        }
      }
    ]
  }
  
  collegeDistributionChartInstance.setOption(option)
}

// 渲染男女学生比例图表
const renderStudentGenderRatioChart = (data) => {
  if (!studentGenderRatioChartInstance) {
    studentGenderRatioChartInstance = echarts.init(studentGenderRatioChart.value)
  }
  
  const option = {
    title: {
      text: '男女学生比例',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      textStyle: {
        fontSize: 14
      }
    },
    legend: {
      orient: 'vertical',
      left: '5%',
      top: 'middle',
      textStyle: {
        fontSize: 14
      },
      itemWidth: 20,
      itemHeight: 14
    },
    series: [
      {
        name: '性别比例',
        type: 'pie',
        radius: ['20%', '50%'],
        center: ['55%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}',
          fontSize: 12,
          fontWeight: 'normal',
          position: 'outside',
          distanceToLabelLine: 5,
          padding: [2, 4]
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)'
          }
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 20,
          smooth: true
        },
        data: [
          { 
            value: data.maleCount, 
            name: '男生',
            itemStyle: { color: '#5470c6' }
          },
          { 
            value: data.femaleCount, 
            name: '女生',
            itemStyle: { color: '#ee6666' }
          }
        ]
      }
    ]
  }
  
  studentGenderRatioChartInstance.setOption(option)
}

// 渲染班级人数分布图表
const renderClassDistributionChart = (data) => {
  if (!classDistributionChartInstance) {
    classDistributionChartInstance = echarts.init(classDistributionChart.value)
  }
  
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
      bottom: '12%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.className),
      axisLabel: {
        interval: 0,
        rotate: data.length > 10 ? 45 : 0,
        fontSize: 12
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: '学生数量',
      nameTextStyle: {
        padding: [0, 0, 0, 40],
        fontSize: 14
      },
      axisLabel: {
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '学生数量',
        type: 'bar',
        barWidth: data.length > 10 ? '40%' : '60%',
        itemStyle: {
          color: function(params) {
            // 根据人数设置不同颜色
            const value = params.value
            if (value < 30) return '#91cc75' // 绿色，人数少
            if (value < 45) return '#fac858' // 黄色，人数中等
            return '#ee6666' // 红色，人数多
          },
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.2)'
          }
        },
        data: data.map(item => item.studentCount),
        label: {
          show: true,
          position: 'top',
          fontSize: 12
        }
      }
    ]
  }
  
  classDistributionChartInstance.setOption(option)
}

// 渲染人员覆盖率图表
const renderCoverageRateChart = (data) => {
  if (!coverageRateChartInstance) {
    coverageRateChartInstance = echarts.init(coverageRateChart.value)
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    radar: {
      indicator: [
        { name: '学生管理', max: 100 },
        { name: '教师分配', max: 100 },
        { name: '宿舍管理', max: 100 },
        { name: '维修响应', max: 100 },
        { name: '班级覆盖', max: 100 }
      ],
      radius: '60%',
      center: ['50%', '55%'],
      name: {
        textStyle: {
          fontSize: 14
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255,255,255,0.1)', 'rgba(230,230,230,0.1)']
        }
      }
    },
    series: [
      {
        name: '人员覆盖率',
        type: 'radar',
        data: [
          {
            value: [
              data.studentCoverage,
              data.teacherCoverage,
              data.dormManagerCoverage,
              data.maintenanceCoverage,
              data.classCoverage
            ],
            name: '覆盖率(%)',
            areaStyle: {
              color: 'rgba(84, 112, 198, 0.5)'
            },
            lineStyle: {
              width: 2
            }
          }
        ]
      }
    ]
  }
  
  coverageRateChartInstance.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  collegeDistributionChartInstance?.resize()
  studentGenderRatioChartInstance?.resize()
  classDistributionChartInstance?.resize()
  coverageRateChartInstance?.resize()
}

// 刷新所有数据
const refreshData = () => {
  getPersonnelOverview()
  getCollegeList()
  getCollegeDistribution()
  getStudentGenderRatio()
  getClassDistribution()
  getCoverageRate()
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    // 初始化图表
    if (collegeDistributionChart.value) {
      collegeDistributionChartInstance = echarts.init(collegeDistributionChart.value)
    }
    if (studentGenderRatioChart.value) {
      studentGenderRatioChartInstance = echarts.init(studentGenderRatioChart.value)
    }
    if (classDistributionChart.value) {
      classDistributionChartInstance = echarts.init(classDistributionChart.value)
    }
    if (coverageRateChart.value) {
      coverageRateChartInstance = echarts.init(coverageRateChart.value)
    }
    
    // 获取数据并渲染图表
    refreshData()
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize)
  })
}

// 组件卸载时清理
const cleanupCharts = () => {
  collegeDistributionChartInstance?.dispose()
  studentGenderRatioChartInstance?.dispose()
  classDistributionChartInstance?.dispose()
  coverageRateChartInstance?.dispose()
  
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
.personnel-distribution-analysis {
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
          
          &.student {
            background-color: #409eff;
          }
          
          &.teacher {
            background-color: #67c23a;
          }
          
          &.dormManager {
            background-color: #e6a23c;
          }
          
          &.maintenance {
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
      height: 550px;
      
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
        height: 480px;
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