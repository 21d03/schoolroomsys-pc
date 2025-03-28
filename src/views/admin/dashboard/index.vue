<template>
  <div class="dashboard-container">
    <!-- 欢迎语 -->
    <el-card class="welcome-card" shadow="hover">
      <div class="welcome-content">
        <div class="avatar-circle">
          {{ userInfo.name ? userInfo.name.charAt(0) : 'U' }}
        </div>
        <div class="welcome-text">
          <h2>欢迎回来，{{ userInfo.name }}</h2>
          <p>{{ getGreeting() }}</p>
        </div>
      </div>
    </el-card>

    <!-- 统计卡片区域 -->
    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>宿舍楼总数</span>
                <el-tag size="small" type="success">运行中</el-tag>
              </div>
            </template>
            <div class="card-content split">
              <div class="split-item">
                <div class="title">正常使用</div>
                <div class="number">{{ statsData.buildingNormal }}</div>
                <div class="desc">栋</div>
              </div>
              <div class="divider"></div>
              <div class="split-item">
                <div class="title">暂停使用</div>
                <div class="number">{{ statsData.buildingStopped }}</div>
                <div class="desc">栋</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>房间总数</span>
                <el-tag size="small" type="primary">共计</el-tag>
              </div>
            </template>
            <div class="card-content split">
              <div class="split-item">
                <div class="title">正常使用</div>
                <div class="number">{{ statsData.roomNormal }}</div>
                <div class="desc">间</div>
              </div>
              <div class="divider"></div>
              <div class="split-item">
                <div class="title">暂停使用</div>
                <div class="number">{{ statsData.roomStopped }}</div>
                <div class="desc">间</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>审批请求</span>
                <el-tag size="small" type="warning">总数</el-tag>
              </div>
            </template>
            <div class="card-content split">
              <div class="split-item">
                <div class="title">待处理</div>
                <div class="number">{{ statsData.approvalPending }}</div>
                <div class="desc">条</div>
              </div>
              <div class="divider"></div>
              <div class="split-item">
                <div class="title">已处理</div>
                <div class="number">{{ statsData.approvalProcessed }}</div>
                <div class="desc">条</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最近审批列表 -->
    <el-card shadow="hover" class="recent-approvals">
      <template #header>
        <div class="card-header">
          <span>最近审批</span>
        </div>
      </template>
      <el-table :data="recentApprovals" style="width: 100%">
        <el-table-column prop="id" label="申请编号" width="160" />
        <el-table-column prop="type" label="申请类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === '请假申请' ? 'primary' : 'success'" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicant" label="申请人" width="180" />
        <el-table-column prop="content" label="申请内容" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.statusType" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

// 获取用户信息
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

// 统计数据
const statsData = ref({
  buildingTotal: 0,
  buildingNormal: 0,
  buildingStopped: 0,
  roomTotal: 0,
  roomNormal: 0,
  roomStopped: 0,
  approvalTotal: 0,
  approvalProcessed: 0,
  approvalPending: 0
})

// 获取统计数据
const fetchStatsData = async () => {
  try {
    const res = await request({
      url: '/api/school/index',
      method: 'get'
    })
    console.log('统计数据响应：', res)
    
    const { code, data } = res.data
    
    if ((code === 0 || code === 1) && data) {
      statsData.value = data
      console.log('统计数据已更新：', statsData.value)
    } else {
      console.error('获取统计数据失败：响应格式不正确', res.data)
    }
  } catch (error) {
    console.error('获取统计数据失败：', error)
    ElMessage.error('获取统计数据失败，请刷新页面重试')
  }
}

// 最近审批数据
const recentApprovals = ref([])

// 获取最近审批数据
const fetchRecentApprovals = async () => {
  try {
    const res = await request({
      url: '/school/approval/recent',
      method: 'get'
    })
    
    console.log('最近审批响应：', res.data)
    
    const { code, data } = res.data
    
    if ((code === 0 || code === 1) && Array.isArray(data)) {
      // 处理审批数据
      recentApprovals.value = data.map(item => ({
        id: item.approvalId,
        type: item.approvalType === '1' ? '请假申请' : '维修申请',
        applicant: `${item.studentName}(${item.studentId})`,
        content: item.content,
        status: getStatusText(item.status),
        statusType: getStatusType(item.status),
        createTime: formatDateTime(item.createTime)
      }))
    } else {
      console.error('获取最近审批数据失败：响应格式不正确', res.data)
    }
  } catch (error) {
    console.error('获取最近审批数据失败：', error)
    ElMessage.error('获取最近审批数据失败，请刷新页面重试')
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    '0': '待审批',
    '1': '已通过',
    '2': '已拒绝'
  }
  return statusMap[status] || '未知'
}

// 获取状态类型（用于标签颜色）
const getStatusType = (status) => {
  const typeMap = {
    '0': 'warning',
    '1': 'success',
    '2': 'danger'
  }
  return typeMap[status] || 'info'
}

// 格式化日期时间
const formatDateTime = (timeArray) => {
  if (!Array.isArray(timeArray) || timeArray.length < 5) {
    return '时间未知'
  }
  const [year, month, day, hour, minute] = timeArray
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

// 页面加载时获取数据
onMounted(() => {
  fetchStatsData()
  fetchRecentApprovals()
})

// 获取问候语
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，请注意休息'
  if (hour < 9) return '早上好，新的一天开始了'
  if (hour < 12) return '上午好，工作顺利'
  if (hour < 14) return '中午好，请适当休息'
  if (hour < 17) return '下午好，继续加油'
  if (hour < 19) return '傍晚好，工作即将结束'
  if (hour < 22) return '晚上好，请放松心情'
  return '夜深了，请注意休息'
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  .welcome-card {
    margin-bottom: 20px;

    .welcome-content {
      padding: 10px;
      display: flex;
      align-items: center;
      gap: 20px;

      .avatar-circle {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: var(--el-color-primary);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: bold;
        flex-shrink: 0;
      }

      .welcome-text {
        flex: 1;

        h2 {
          margin: 0;
          font-size: 24px;
          color: #303133;
          margin-bottom: 8px;
        }

        p {
          margin: 0;
          font-size: 16px;
          color: #606266;
        }
      }
    }
  }

  .stat-cards {
    margin-bottom: 20px;

    .stat-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .card-content {
        padding: 10px 0;
        text-align: center;

        &.split {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;

          .split-item {
            flex: 1;
            text-align: center;

            .title {
              font-size: 14px;
              color: #909399;
              margin-bottom: 8px;
            }

            .number {
              font-size: 28px;
              font-weight: bold;
              color: #303133;
              line-height: 1.2;
              margin-bottom: 4px;
            }

            .desc {
              font-size: 12px;
              color: #909399;
            }
          }

          .divider {
            width: 1px;
            height: 40px;
            background-color: #EBEEF5;
            margin: 0 20px;
          }
        }

        .number {
          font-size: 36px;
          font-weight: bold;
          color: #303133;
          line-height: 1.2;
        }

        .desc {
          margin-top: 10px;
          color: #909399;
          font-size: 14px;
        }
      }
    }
  }

  .recent-approvals {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

:deep(.el-card__header) {
  padding: 12px 20px;
  font-weight: 500;
}
</style> 