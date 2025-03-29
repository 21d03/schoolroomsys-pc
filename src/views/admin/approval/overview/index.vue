<template>
  <div class="approval-overview-container">
    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-card-content">
              <div class="stat-icon pending">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.pending || 0 }}</div>
                <div class="stat-title">待处理审批</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-card-content">
              <div class="stat-icon approved">
                <el-icon><Check /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.approved || 0 }}</div>
                <div class="stat-title">已批准</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-card-content">
              <div class="stat-icon rejected">
                <el-icon><Close /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.rejected || 0 }}</div>
                <div class="stat-title">已拒绝</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-card-content">
              <div class="stat-icon total">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.total || 0 }}</div>
                <div class="stat-title">总审批数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 待处理审批列表 -->
    <div class="pending-approvals">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <div class="header-title">待处理审批</div>
            <div class="header-actions">
              <el-button type="primary" @click="refreshData">刷新</el-button>
            </div>
          </div>
        </template>
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="请假审批" name="leave">
            <div class="tab-content">
              <el-table 
                :data="pendingLeaveList" 
                v-loading="loadingLeave" 
                style="width: 100%"
                empty-text="暂无待处理的请假申请"
              >
                <el-table-column prop="leaveId" label="申请编号" width="100" align="center" />
                <el-table-column prop="studentName" label="学生姓名" width="120" align="center" />
                <el-table-column prop="studentId" label="学号" width="120" align="center" />
                <el-table-column prop="leaveType" label="请假类型" width="100" align="center" />
                <el-table-column prop="leaveReason" label="请假原因" min-width="200" align="center" />
                <el-table-column prop="leaveStartTime" label="开始时间" width="160" align="center" />
                <el-table-column prop="leaveEndTime" label="结束时间" width="160" align="center" />
                <el-table-column prop="applyTime" label="申请时间" width="160" align="center" />
                <el-table-column label="操作" width="180" align="center" fixed="right">
                  <template #default="scope">
                    <el-button type="primary" link @click="handleViewLeave(scope.row)">查看</el-button>
                    <el-button type="success" link @click="handleApprove('leave', scope.row)">批准</el-button>
                    <el-button type="danger" link @click="handleReject('leave', scope.row)">拒绝</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="报修申请" name="repair">
            <div class="tab-content">
              <el-table 
                :data="pendingRepairList" 
                v-loading="loadingRepair" 
                style="width: 100%"
                empty-text="暂无待处理的报修申请"
              >
                <el-table-column prop="repairId" label="申请编号" width="100" align="center" />
                <el-table-column prop="studentName" label="申请人" width="120" align="center" />
                <el-table-column prop="buildingName" label="宿舍楼" width="120" align="center" />
                <el-table-column prop="roomNumber" label="房间号" width="100" align="center" />
                <el-table-column prop="repairType" label="报修类型" width="100" align="center" />
                <el-table-column prop="repairContent" label="报修内容" min-width="200" align="center" />
                <el-table-column prop="applyTime" label="申请时间" width="160" align="center" />
                <el-table-column label="操作" width="180" align="center" fixed="right">
                  <template #default="scope">
                    <el-button type="primary" link @click="handleViewRepair(scope.row)">查看</el-button>
                    <el-button type="success" link @click="handleApprove('repair', scope.row)">批准</el-button>
                    <el-button type="danger" link @click="handleReject('repair', scope.row)">拒绝</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <!-- 请假详情对话框 -->
    <el-dialog 
      title="请假详情" 
      v-model="leaveDetailVisible" 
      width="650px"
      destroy-on-close
    >
      <div v-if="currentLeave">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学生姓名" :span="1">{{ currentLeave.studentName }}</el-descriptions-item>
          <el-descriptions-item label="学号" :span="1">{{ currentLeave.studentId }}</el-descriptions-item>
          <el-descriptions-item label="请假类型" :span="1">{{ currentLeave.leaveType }}</el-descriptions-item>
          <el-descriptions-item label="申请时间" :span="1">{{ currentLeave.applyTime }}</el-descriptions-item>
          <el-descriptions-item label="开始时间" :span="1">{{ currentLeave.leaveStartTime }}</el-descriptions-item>
          <el-descriptions-item label="结束时间" :span="1">{{ currentLeave.leaveEndTime }}</el-descriptions-item>
          <el-descriptions-item label="请假原因" :span="2">{{ currentLeave.leaveReason }}</el-descriptions-item>
          <el-descriptions-item label="附件" :span="2">
            <div v-if="currentLeave.attachments && currentLeave.attachments.length > 0">
              <el-image 
                v-for="(img, index) in currentLeave.attachments" 
                :key="index"
                :src="img.url" 
                :preview-src-list="currentLeave.attachments.map(item => item.url)"
                fit="contain"
                class="attachment-image"
              />
            </div>
            <span v-else>无附件</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="leaveDetailVisible = false">关闭</el-button>
          <el-button type="success" @click="handleApprove('leave', currentLeave)">批准</el-button>
          <el-button type="danger" @click="handleReject('leave', currentLeave)">拒绝</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 报修详情对话框 -->
    <el-dialog 
      title="报修详情" 
      v-model="repairDetailVisible" 
      width="650px"
      destroy-on-close
    >
      <div v-if="currentRepair">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请人" :span="1">{{ currentRepair.studentName }}</el-descriptions-item>
          <el-descriptions-item label="学号" :span="1">{{ currentRepair.studentId }}</el-descriptions-item>
          <el-descriptions-item label="宿舍楼" :span="1">{{ currentRepair.buildingName }}</el-descriptions-item>
          <el-descriptions-item label="房间号" :span="1">{{ currentRepair.roomNumber }}</el-descriptions-item>
          <el-descriptions-item label="报修类型" :span="1">{{ currentRepair.repairType }}</el-descriptions-item>
          <el-descriptions-item label="申请时间" :span="1">{{ currentRepair.applyTime }}</el-descriptions-item>
          <el-descriptions-item label="报修内容" :span="2">{{ currentRepair.repairContent }}</el-descriptions-item>
          <el-descriptions-item label="报修图片" :span="2">
            <div v-if="currentRepair.images && currentRepair.images.length > 0">
              <el-image 
                v-for="(img, index) in currentRepair.images" 
                :key="index"
                :src="img.url" 
                :preview-src-list="currentRepair.images.map(item => item.url)"
                fit="contain"
                class="attachment-image"
              />
            </div>
            <span v-else>无图片</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="repairDetailVisible = false">关闭</el-button>
          <el-button type="success" @click="handleApprove('repair', currentRepair)">批准</el-button>
          <el-button type="danger" @click="handleReject('repair', currentRepair)">拒绝</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 处理结果对话框 -->
    <el-dialog 
      :title="processingTitle" 
      v-model="processingDialogVisible" 
      width="500px"
      destroy-on-close
    >
      <el-form :model="processingForm" ref="processingFormRef">
        <el-form-item 
          label="处理意见" 
          prop="comment" 
          :rules="[{ required: true, message: '请输入处理意见', trigger: 'blur' }]"
        >
          <el-input 
            v-model="processingForm.comment" 
            type="textarea" 
            rows="4" 
            placeholder="请输入处理意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="processingDialogVisible = false">取消</el-button>
          <el-button 
            :type="processingAction === 'approve' ? 'success' : 'danger'" 
            @click="submitProcessing"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock, Check, Close, Document } from '@element-plus/icons-vue'
import request from '@/utils/request'

// 统计数据
const stats = reactive({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0
})

// 标签页相关
const activeTab = ref('leave')
const loadingLeave = ref(false)
const loadingRepair = ref(false)
const pendingLeaveList = ref([])
const pendingRepairList = ref([])

// 详情对话框
const leaveDetailVisible = ref(false)
const repairDetailVisible = ref(false)
const currentLeave = ref(null)
const currentRepair = ref(null)

// 处理对话框
const processingDialogVisible = ref(false)
const processingAction = ref('') // 'approve' 或 'reject'
const processingType = ref('') // 'leave' 或 'repair'
const processingId = ref('')
const processingForm = reactive({
  comment: ''
})
const processingFormRef = ref(null)

// 计算属性
const processingTitle = computed(() => {
  const actionText = processingAction.value === 'approve' ? '批准' : '拒绝'
  const typeText = processingType.value === 'leave' ? '请假' : '报修'
  return `${actionText}${typeText}申请`
})

// 获取统计数据
const getApprovalStats = async () => {
  try {
    const res = await request.get('/school/approval/count')
    console.log('API返回数据:', res)  // 添加日志
    const { code, msg, data } = res.data
    if (code === 0 || code === 1) {
    //   stats.total = res.data.totalCount || 0
    //   stats.pending = res.data.pendingCount || 0
    //   stats.approved = res.data.approvedCount || 0
    //   stats.rejected = res.data.rejectedCount || 0
    stats.total = data.totalCount || 0
    stats.pending = data.pendingCount || 0
    stats.approved = data.approvedCount || 0
    stats.rejected = data.rejectedCount || 0
    
      console.log('更新后的统计数据:', { ...stats })  // 添加日志
    } else {
      ElMessage.error(res.msg || '获取审批统计数据失败')
    }
  } catch (error) {
    console.error('获取审批统计数据失败:', error)
    ElMessage.error('获取审批统计数据失败，请稍后重试')
  }
}

// 获取待处理的请假列表
const getPendingLeaveList = async () => {
  loadingLeave.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      pendingLeaveList.value = [
        {
          leaveId: 'L20230001',
          studentName: '张三',
          studentId: '20210101',
          leaveType: '事假',
          leaveReason: '家中有事，需要请假回家处理',
          leaveStartTime: '2023-09-15 08:00',
          leaveEndTime: '2023-09-18 20:00',
          applyTime: '2023-09-10 15:30',
          attachments: []
        },
        {
          leaveId: 'L20230002',
          studentName: '李四',
          studentId: '20210102',
          leaveType: '病假',
          leaveReason: '感冒发烧，需要去医院就诊',
          leaveStartTime: '2023-09-16 08:00',
          leaveEndTime: '2023-09-17 20:00',
          applyTime: '2023-09-15 10:45',
          attachments: []
        }
      ]
      loadingLeave.value = false
    }, 500)
  } catch (error) {
    console.error('获取待处理请假列表失败:', error)
    loadingLeave.value = false
  }
}

// 获取待处理的报修列表
const getPendingRepairList = async () => {
  loadingRepair.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      pendingRepairList.value = [
        {
          repairId: 'R20230001',
          studentName: '王五',
          studentId: '20210103',
          buildingName: '梁园1号楼',
          roomNumber: '101',
          repairType: '水电',
          repairContent: '宿舍水龙头漏水，需要修理',
          applyTime: '2023-09-14 09:20',
          images: []
        },
        {
          repairId: 'R20230002',
          studentName: '赵六',
          studentId: '20210104',
          buildingName: '睢阳3号楼',
          roomNumber: '205',
          repairType: '家具',
          repairContent: '衣柜门把手损坏，无法正常使用',
          applyTime: '2023-09-15 14:10',
          images: []
        }
      ]
      loadingRepair.value = false
    }, 500)
  } catch (error) {
    console.error('获取待处理报修列表失败:', error)
    loadingRepair.value = false
  }
}

// 切换标签页
const handleTabClick = (tab) => {
  if (tab.paneName === 'leave') {
    getPendingLeaveList()
  } else if (tab.paneName === 'repair') {
    getPendingRepairList()
  }
}

// 查看请假详情
const handleViewLeave = (row) => {
  currentLeave.value = { ...row }
  leaveDetailVisible.value = true
}

// 查看报修详情
const handleViewRepair = (row) => {
  currentRepair.value = { ...row }
  repairDetailVisible.value = true
}

// 批准申请
const handleApprove = (type, row) => {
  processingType.value = type
  processingAction.value = 'approve'
  processingId.value = type === 'leave' ? row.leaveId : row.repairId
  processingForm.comment = ''
  processingDialogVisible.value = true
}

// 拒绝申请
const handleReject = (type, row) => {
  processingType.value = type
  processingAction.value = 'reject'
  processingId.value = type === 'leave' ? row.leaveId : row.repairId
  processingForm.comment = ''
  processingDialogVisible.value = true
}

// 提交处理
const submitProcessing = async () => {
  if (!processingFormRef.value) return
  
  await processingFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请输入处理意见')
      return
    }
    
    try {
      // 模拟API调用
      setTimeout(() => {
        const actionText = processingAction.value === 'approve' ? '批准' : '拒绝'
        const typeText = processingType.value === 'leave' ? '请假' : '报修'
        
        ElMessage.success(`已${actionText}${typeText}申请`)
        processingDialogVisible.value = false
        
        // 关闭详情对话框
        if (processingType.value === 'leave') {
          leaveDetailVisible.value = false
          getPendingLeaveList()
        } else {
          repairDetailVisible.value = false
          getPendingRepairList()
        }
        
        // 刷新统计数据
        getApprovalStats()
      }, 500)
    } catch (error) {
      console.error('处理审批失败:', error)
      ElMessage.error('处理审批失败，请稍后重试')
    }
  })
}

// 刷新数据
const refreshData = () => {
  getApprovalStats()
  if (activeTab.value === 'leave') {
    getPendingLeaveList()
  } else {
    getPendingRepairList()
  }
}

// 页面加载时获取数据
onMounted(() => {
  getApprovalStats()
  getPendingLeaveList()
})
</script>

<style lang="scss" scoped>
.approval-overview-container {
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
          
          &.pending {
            background-color: #409eff;
          }
          
          &.approved {
            background-color: #67c23a;
          }
          
          &.rejected {
            background-color: #f56c6c;
          }
          
          &.total {
            background-color: #909399;
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
  
  .pending-approvals {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-title {
        font-size: 16px;
        font-weight: 600;
      }
    }
    
    .tab-content {
      margin-top: 16px;
    }
  }
  
  .attachment-image {
    width: 100px;
    height: 100px;
    margin-right: 8px;
    margin-bottom: 8px;
    border-radius: 4px;
    cursor: pointer;
  }
}
</style> 