<template>
  <div class="leave-approval-container">
    <!-- 搜索过滤区域 -->
    <div class="filter-container">
      <el-card shadow="never">
        <div class="filter-form">
          <el-form :inline="true" :model="queryParams" ref="queryForm">
            <el-form-item label="学生姓名" prop="studentName">
              <el-input v-model="queryParams.studentName" placeholder="请输入学生姓名" clearable />
            </el-form-item>
            <el-form-item label="学号" prop="studentId">
              <el-input v-model="queryParams.studentId" placeholder="请输入学号" clearable />
            </el-form-item>
            <el-form-item label="请假类型" prop="leaveType">
              <el-select v-model="queryParams.leaveType" placeholder="请选择类型" clearable style="width: 120px">
                <el-option label="事假" value="事假" />
                <el-option label="病假" value="病假" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px">
                <el-option label="待审批" value="0" />
                <el-option label="已批准" value="1" />
                <el-option label="已拒绝" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="申请时间" prop="applyTimeRange">
              <el-date-picker
                v-model="queryParams.applyTimeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 240px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-card shadow="never">
        <div class="table-header">
          <div class="table-title">请假审批列表</div>
          <div class="table-actions">
            <el-button-group>
              <el-button :type="activeStatus === '' ? 'primary' : 'default'" @click="setActiveStatus('')">全部</el-button>
              <el-button :type="activeStatus === '0' ? 'primary' : 'default'" @click="setActiveStatus('0')">待审批</el-button>
              <el-button :type="activeStatus === '1' ? 'primary' : 'default'" @click="setActiveStatus('1')">已批准</el-button>
              <el-button :type="activeStatus === '2' ? 'primary' : 'default'" @click="setActiveStatus('2')">已拒绝</el-button>
            </el-button-group>
            <el-button type="primary" @click="refreshList">刷新</el-button>
          </div>
        </div>
        
        <el-table 
          :data="leaveList" 
          border 
          v-loading="loading" 
          style="width: 100%"
        >
          <el-table-column prop="leaveId" label="申请编号" width="100" align="center" />
          <el-table-column prop="studentName" label="学生姓名" width="120" align="center" />
          <el-table-column prop="studentId" label="学号" width="120" align="center" />
          <el-table-column prop="leaveType" label="请假类型" width="100" align="center" />
          <el-table-column prop="leaveReason" label="请假原因" min-width="180" align="center" />
          <el-table-column prop="leaveStartTime" label="开始时间" width="160" align="center" />
          <el-table-column prop="leaveEndTime" label="结束时间" width="160" align="center" />
          <el-table-column prop="applyTime" label="申请时间" width="160" align="center" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag type="warning" v-if="scope.row.status === '0'">待审批</el-tag>
              <el-tag type="success" v-else-if="scope.row.status === '1'">已批准</el-tag>
              <el-tag type="danger" v-else-if="scope.row.status === '2'">已拒绝</el-tag>
              <el-tag v-else>未知</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="处理时间" width="160" align="center">
            <template #default="scope">
              <span v-if="scope.row.processTime">{{ scope.row.processTime }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="180" align="center" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="handleView(scope.row)">查看</el-button>
              <template v-if="scope.row.status === '0'">
                <el-button type="success" link @click="handleApprove(scope.row)">批准</el-button>
                <el-button type="danger" link @click="handleReject(scope.row)">拒绝</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 请假详情对话框 -->
    <el-dialog 
      title="请假详情" 
      v-model="detailVisible" 
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
          <template v-if="currentLeave.status !== '0'">
            <el-descriptions-item label="审批结果" :span="1">
              <el-tag type="success" v-if="currentLeave.status === '1'">已批准</el-tag>
              <el-tag type="danger" v-else-if="currentLeave.status === '2'">已拒绝</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="处理时间" :span="1">{{ currentLeave.processTime }}</el-descriptions-item>
            <el-descriptions-item label="处理意见" :span="2">{{ currentLeave.comment }}</el-descriptions-item>
          </template>
        </el-descriptions>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <template v-if="currentLeave && currentLeave.status === '0'">
            <el-button type="success" @click="handleApprove(currentLeave)">批准</el-button>
            <el-button type="danger" @click="handleReject(currentLeave)">拒绝</el-button>
          </template>
        </div>
      </template>
    </el-dialog>

    <!-- 处理对话框 -->
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
import request from '@/utils/request'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  studentName: '',
  studentId: '',
  leaveType: '',
  status: '',
  applyTimeRange: []
})

// 表格数据
const leaveList = ref([])
const loading = ref(false)
const total = ref(0)
const activeStatus = ref('')

// 详情对话框
const detailVisible = ref(false)
const currentLeave = ref(null)

// 处理对话框
const processingDialogVisible = ref(false)
const processingAction = ref('') // 'approve' 或 'reject'
const processingId = ref('')
const processingForm = reactive({
  comment: ''
})
const processingFormRef = ref(null)

// 计算属性
const processingTitle = computed(() => {
  return processingAction.value === 'approve' ? '批准请假申请' : '拒绝请假申请'
})

// 获取请假列表
const getList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      // 模拟数据
      leaveList.value = [
        {
          leaveId: 'L20230001',
          studentName: '张三',
          studentId: '20210101',
          leaveType: '事假',
          leaveReason: '家中有事，需要请假回家处理',
          leaveStartTime: '2023-09-15 08:00',
          leaveEndTime: '2023-09-18 20:00',
          applyTime: '2023-09-10 15:30',
          status: '0', // 待审批
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
          status: '1', // 已批准
          processTime: '2023-09-15 14:20',
          comment: '情况属实，准予请假',
          attachments: []
        },
        {
          leaveId: 'L20230003',
          studentName: '王五',
          studentId: '20210103',
          leaveType: '其他',
          leaveReason: '参加学校组织的社会实践活动',
          leaveStartTime: '2023-09-20 08:00',
          leaveEndTime: '2023-09-25 20:00',
          applyTime: '2023-09-12 09:30',
          status: '2', // 已拒绝
          processTime: '2023-09-13 11:15',
          comment: '请提供活动相关证明文件',
          attachments: []
        }
      ]
      
      // 过滤状态
      if (activeStatus.value) {
        leaveList.value = leaveList.value.filter(item => item.status === activeStatus.value)
      }
      
      total.value = leaveList.value.length
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取请假列表失败:', error)
    ElMessage.error('获取请假列表失败，请稍后重试')
    leaveList.value = []
    total.value = 0
    loading.value = false
  }
}

// 设置活动状态过滤
const setActiveStatus = (status) => {
  activeStatus.value = status
  queryParams.status = status
  queryParams.pageNum = 1
  getList()
}

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  // 保留分页信息
  const { pageNum, pageSize } = queryParams
  
  // 重置查询条件
  Object.assign(queryParams, {
    pageNum,
    pageSize,
    studentName: '',
    studentId: '',
    leaveType: '',
    status: activeStatus.value, // 保持状态过滤
    applyTimeRange: []
  })
  
  getList()
}

// 刷新列表
const refreshList = () => {
  getList()
}

// 处理页面大小变化
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  getList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  getList()
}

// 查看详情
const handleView = (row) => {
  currentLeave.value = { ...row }
  detailVisible.value = true
}

// 批准
const handleApprove = (row) => {
  processingAction.value = 'approve'
  processingId.value = row.leaveId
  processingForm.comment = ''
  processingDialogVisible.value = true
}

// 拒绝
const handleReject = (row) => {
  processingAction.value = 'reject'
  processingId.value = row.leaveId
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
        
        ElMessage.success(`已${actionText}请假申请`)
        processingDialogVisible.value = false
        
        // 关闭详情对话框
        detailVisible.value = false
        
        // 刷新列表
        getList()
      }, 500)
    } catch (error) {
      console.error('处理请假申请失败:', error)
      ElMessage.error('处理请假申请失败，请稍后重试')
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.leave-approval-container {
  .filter-container {
    margin-bottom: 16px;
  }

  .table-container {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .table-title {
        font-size: 16px;
        font-weight: 600;
      }

      .table-actions {
        display: flex;
        gap: 10px;
      }
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
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