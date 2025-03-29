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
              <!-- 添加查询表单 -->
              <div class="filter-container">
                <el-form :inline="true" :model="leaveQueryParams" ref="leaveQueryForm">
                  <el-form-item label="学生姓名" prop="studentName">
                    <el-input
                      v-model="leaveQueryParams.studentName"
                      placeholder="请输入学生姓名"
                      clearable
                      @keyup.enter="handleLeaveQuery"
                    />
                  </el-form-item>
                  <el-form-item label="学号" prop="studentId">
                    <el-input
                      v-model="leaveQueryParams.studentId"
                      placeholder="请输入学号"
                      clearable
                      @keyup.enter="handleLeaveQuery"
                    />
                  </el-form-item>
                  <el-form-item label="状态" prop="status">
                    <el-select 
                      v-model="leaveQueryParams.status" 
                      placeholder="请选择状态" 
                      clearable
                      style="width: 160px;"
                    >
                      <el-option label="待审批" value="0" />
                      <el-option label="已通过" value="1" />
                      <el-option label="已拒绝" value="2" />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleLeaveQuery">查询</el-button>
                    <el-button @click="resetLeaveQuery">重置</el-button>
                  </el-form-item>
                </el-form>
              </div>
              
              <!-- 请假列表 -->
              <el-table 
                :data="pendingLeaveList" 
                v-loading="loadingLeave" 
                style="width: 100%"
                empty-text="暂无请假申请数据"
              >
                <el-table-column prop="approvalId" label="申请编号" width="100" align="center" />
                <el-table-column prop="studentName" label="学生姓名" width="120" align="center" />
                <el-table-column prop="studentId" label="学号" width="120" align="center" />
                <el-table-column prop="leaveReason" label="请假原因" min-width="200" align="center" />
                <el-table-column prop="startTime" label="开始时间" width="160" align="center" />
                <el-table-column prop="endTime" label="结束时间" width="160" align="center" />
                <el-table-column prop="createTime" label="申请时间" width="160" align="center" />
                <el-table-column label="状态" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)">
                      {{ getStatusText(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="leaveQueryParams.pageNum"
                  v-model:page-size="leaveQueryParams.pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="leaveTotal"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleLeaveSizeChange"
                  @current-change="handleLeaveCurrentChange"
                />
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="报修申请" name="repair">
            <div class="tab-content">
              <!-- 添加查询表单 -->
              <div class="filter-container">
                <el-form :inline="true" :model="repairQueryParams" ref="repairQueryForm">
                  <el-form-item label="学生姓名" prop="studentName">
                    <el-input
                      v-model="repairQueryParams.studentName"
                      placeholder="请输入学生姓名"
                      clearable
                      @keyup.enter="handleRepairQuery"
                    />
                  </el-form-item>
                  <el-form-item label="学号" prop="studentId">
                    <el-input
                      v-model="repairQueryParams.studentId"
                      placeholder="请输入学号"
                      clearable
                      @keyup.enter="handleRepairQuery"
                    />
                  </el-form-item>
                  <el-form-item label="宿管审批状态" prop="hmStatus">
                    <el-select 
                      v-model="repairQueryParams.hmStatus" 
                      placeholder="请选择状态" 
                      clearable
                      style="width: 160px;"
                    >
                      <el-option label="待审批" value="0" />
                      <el-option label="已通过" value="1" />
                      <el-option label="已拒绝" value="2" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="维修状态" prop="rpStatus">
                    <el-select 
                      v-model="repairQueryParams.rpStatus" 
                      placeholder="请选择状态" 
                      clearable
                      style="width: 160px;"
                    >
                      <el-option label="待处理" value="0" />
                      <el-option label="已完成" value="1" />
                      <el-option label="已拒绝" value="2" />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleRepairQuery">查询</el-button>
                    <el-button @click="resetRepairQuery">重置</el-button>
                  </el-form-item>
                </el-form>
              </div>
              
              <!-- 报修列表 -->
              <el-table 
                :data="pendingRepairList" 
                v-loading="loadingRepair" 
                style="width: 100%"
                empty-text="暂无报修申请数据"
              >
                <el-table-column prop="approvalId" label="申请编号" width="100" align="center" />
                <el-table-column prop="studentName" label="申请人" width="120" align="center" />
                <el-table-column prop="buildName" label="宿舍楼" width="120" align="center" />
                <el-table-column prop="roomId" label="房间号" width="100" align="center" />
                <el-table-column prop="repairContent" label="报修内容" min-width="200" align="center" />
                <el-table-column prop="createTime" label="申请时间" width="160" align="center" />
                <el-table-column label="宿管审批" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.hmStatus)">
                      {{ getStatusText(scope.row.hmStatus) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="维修状态" width="100" align="center">
                  <template #default="scope">
                    <el-tag :type="getRepairStatusType(scope.row.rpStatus)">
                      {{ getRepairStatusText(scope.row.rpStatus) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="repairQueryParams.pageNum"
                  v-model:page-size="repairQueryParams.pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="repairTotal"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleRepairSizeChange"
                  @current-change="handleRepairCurrentChange"
                />
              </div>
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

// 请假查询参数
const leaveQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  studentId: '',
  studentName: '',
  status: ''
})

// 请假列表数据
const leaveTotal = ref(0)
const leaveQueryForm = ref(null)

// 报修查询参数
const repairQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  studentId: '',
  studentName: '',
  hmStatus: '',
  rpStatus: ''
})

// 报修列表数据
const repairTotal = ref(0)
const repairQueryForm = ref(null)

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
    const res = await request.post('/school/approval/leave/page', leaveQueryParams)
    const { code, msg, data } = res.data
    if (code === 0 || code === 1) {
      pendingLeaveList.value = data.records
      leaveTotal.value = data.total
    } else {
      ElMessage.error(res.msg || '获取请假列表失败')
    }
  } catch (error) {
    console.error('获取请假列表失败:', error)
    ElMessage.error('获取请假列表失败，请稍后重试')
  } finally {
    loadingLeave.value = false
  }
}

// 查询请假列表
const handleLeaveQuery = () => {
  leaveQueryParams.pageNum = 1
  getPendingLeaveList()
}

// 重置请假查询
const resetLeaveQuery = () => {
  leaveQueryForm.value?.resetFields()
  leaveQueryParams.pageNum = 1
  leaveQueryParams.pageSize = 10
  getPendingLeaveList()
}

// 处理请假列表页码变化
const handleLeaveCurrentChange = (val) => {
  leaveQueryParams.pageNum = val
  getPendingLeaveList()
}

// 处理请假列表每页数量变化
const handleLeaveSizeChange = (val) => {
  leaveQueryParams.pageSize = val
  leaveQueryParams.pageNum = 1
  getPendingLeaveList()
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case '0': return 'warning'
    case '1': return 'success'
    case '2': return 'danger'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case '0': return '待审批'
    case '1': return '已通过'
    case '2': return '已拒绝'
    default: return '未知'
  }
}

// 获取待处理的报修列表
const getPendingRepairList = async () => {
  loadingRepair.value = true
  try {
    const res = await request.post('/school/approval/repair/page', repairQueryParams)
    const { code, msg, data } = res.data
    if (code === 0) {
      pendingRepairList.value = data.records
      repairTotal.value = data.total
    } else {
      ElMessage.error(msg || '获取报修列表失败')
    }
  } catch (error) {
    console.error('获取报修列表失败:', error)
    ElMessage.error('获取报修列表失败，请稍后重试')
  } finally {
    loadingRepair.value = false
  }
}

// 查询报修列表
const handleRepairQuery = () => {
  repairQueryParams.pageNum = 1
  getPendingRepairList()
}

// 重置报修查询
const resetRepairQuery = () => {
  repairQueryForm.value?.resetFields()
  repairQueryParams.pageNum = 1
  repairQueryParams.pageSize = 10
  getPendingRepairList()
}

// 处理报修列表页码变化
const handleRepairCurrentChange = (val) => {
  repairQueryParams.pageNum = val
  getPendingRepairList()
}

// 处理报修列表每页数量变化
const handleRepairSizeChange = (val) => {
  repairQueryParams.pageSize = val
  repairQueryParams.pageNum = 1
  getPendingRepairList()
}

// 获取维修状态类型
const getRepairStatusType = (status) => {
  switch (status) {
    case '0': return 'info'
    case '1': return 'success'
    case '2': return 'danger'
    default: return 'info'
  }
}

// 获取维修状态文本
const getRepairStatusText = (status) => {
  switch (status) {
    case '0': return '待处理'
    case '1': return '已完成'
    case '2': return '已拒绝'
    default: return '未知'
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

  // 添加状态选择框的样式
  :deep(.el-select) {
    width: 160px;  // 设置选择框宽度为160px
  }
}
</style> 