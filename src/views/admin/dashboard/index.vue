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
                <el-tag size="small" type="success">正常运行</el-tag>
              </div>
            </template>
            <div class="card-content">
              <div class="number">12</div>
              <div class="desc">栋宿舍楼</div>
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
            <div class="card-content">
              <div class="number">486</div>
              <div class="desc">间宿舍</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <template #header>
              <div class="card-header">
                <span>待处理审批</span>
                <el-tag size="small" type="danger">待处理</el-tag>
              </div>
            </template>
            <div class="card-content">
              <div class="number">24</div>
              <div class="desc">条待处理</div>
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
          <el-button type="primary" link>查看全部</el-button>
        </div>
      </template>
      <el-table :data="recentApprovals" style="width: 100%">
        <el-table-column prop="id" label="申请编号" width="120" />
        <el-table-column prop="type" label="申请类型" width="120" />
        <el-table-column prop="applicant" label="申请人" width="120" />
        <el-table-column prop="content" label="申请内容" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '待审批' ? 'warning' : 'success'">
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
import { ref, computed } from 'vue'

// 获取用户信息
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

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

// 模拟最近审批数据
const recentApprovals = ref([
  {
    id: 'AP202401001',
    type: '维修申请',
    applicant: '张三',
    content: '寝室空调不制冷',
    status: '待审批',
    createTime: '2024-01-15 14:30:00'
  },
  {
    id: 'AP202401002',
    type: '调宿申请',
    applicant: '李四',
    content: '因身体原因申请调换低层宿舍',
    status: '已审批',
    createTime: '2024-01-15 15:20:00'
  },
  {
    id: 'AP202401003',
    type: '访客申请',
    applicant: '王五',
    content: '家长探访',
    status: '待审批',
    createTime: '2024-01-15 16:45:00'
  }
])
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
        text-align: center;
        padding: 10px 0;

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