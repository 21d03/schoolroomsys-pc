<template>
  <div class="repair-approval-container">
    <!-- 搜索过滤区域 -->
    <div class="filter-container">
      <el-card shadow="never">
        <div class="filter-form">
          <el-form :inline="true" :model="queryParams" ref="queryForm">
            <el-form-item label="申请人" prop="studentName">
              <el-input v-model="queryParams.studentName" placeholder="请输入申请人姓名" clearable />
            </el-form-item>
            <el-form-item label="宿舍楼" prop="buildingName">
              <el-input v-model="queryParams.buildingName" placeholder="请输入宿舍楼" clearable />
            </el-form-item>
            <el-form-item label="房间号" prop="roomNumber">
              <el-input v-model="queryParams.roomNumber" placeholder="请输入房间号" clearable />
            </el-form-item>
            <el-form-item label="报修类型" prop="repairType">
              <el-select v-model="queryParams.repairType" placeholder="请选择类型" clearable style="width: 120px">
                <el-option label="水电" value="水电" />
                <el-option label="家具" value="家具" />
                <el-option label="设施" value="设施" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px">
                <el-option label="待审批" value="0" />
                <el-option label="已批准" value="1" />
                <el-option label="已拒绝" value="2" />
                <el-option label="已完成" value="3" />
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
          <div class="table-title">报修审批列表</div>
          <div class="table-actions">
            <el-button-group>
              <el-button :type="activeStatus === '' ? 'primary' : 'default'" @click="setActiveStatus('')">全部</el-button>
              <el-button :type="activeStatus === '0' ? 'primary' : 'default'" @click="setActiveStatus('0')">待审批</el-button>
              <el-button :type="activeStatus === '1' ? 'primary' : 'default'" @click="setActiveStatus('1')">已批准</el-button>
              <el-button :type="activeStatus === '2' ? 'primary' : 'default'" @click="setActiveStatus('2')">已拒绝</el-button>
              <el-button :type="activeStatus === '3' ? 'primary' : 'default'" @click="setActiveStatus('3')">已完成</el-button>
            </el-button-group>
            <el-button type="primary" @click="refreshList">刷新</el-button>
          </div>
        </div>
        
        <el-table 
          :data="repairList" 
          border 
          v-loading="loading" 
          style="width: 100%"
        >
          <el-table-column prop="repairId" label="申请编号" width="100" align="center" />
          <el-table-column prop="studentName" label="申请人" width="100" align="center" />
          <el-table-column prop="buildingName" label="宿舍楼" width="120" align="center" />
          <el-table-column prop="roomNumber" label="房间号" width="100" align="center" />
          <el-table-column prop="repairType" label="报修类型" width="100" align="center" />
          <el-table-column prop="repairContent" label="报修内容" min-width="180" align="center" />
          <el-table-column prop="applyTime" label="申请时间" width="160" align="center" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag type="warning" v-if="scope.row.status === '0'">待审批</el-tag>
              <el-tag type="success" v-else-if="scope.row.status === '1'">已批准</el-tag>
              <el-tag type="danger" v-else-if="scope.row.status === '2'">已拒绝</el-tag>
              <el-tag type="info" v-else-if="scope.row.status === '3'">已完成</el-tag>
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
              <template v-if="scope.row.status === '1'">
                <el-button type="info" link @click="handleComplete(scope.row)">标记完成</el-button>
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

    <!-- 报修详情对话框 -->
    <el-dialog 
      title="报修详情" 
      v-model="detailVisible" 
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
                class="repair-image"
              />
            </div>
            <span v-else>无图片</span>
          </el-descriptions-item>
          <template v-if="currentRepair.status !== '0'">
            <el-descriptions-item label="审批结果" :span="1">
              <el-tag type="success" v-if="currentRepair.status === '1'">已批准</el-tag>
              <el-tag type="danger" v-else-if="currentRepair.status === '2'">已拒绝</el-tag>
              <el-tag type="info" v-else-if="currentRepair.status === '3'">已完成</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="处理时间" :span="1">{{ currentRepair.processTime }}</el-descriptions-item>
            <el-descriptions-item label="处理意见" :span="2">{{ currentRepair.comment }}</el-descriptions-item>
          </template>
        </el-descriptions>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <template v-if="currentRepair && currentRepair.status === '0'">
            <el-button type="success" @click="handleApprove(currentRepair)">批准</el-button>
            <el-button type="danger" @click="handleReject(currentRepair)">拒绝</el-button>
          </template>
          <template v-if="currentRepair && currentRepair.status === '1'">
            <el-button type="info" @click="handleComplete(currentRepair)">标记完成</el-button>
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
        <template v-if="processingAction === 'approve'">
          <el-form-item label="分配维修人员" prop="workerId">
            <el-select 
              v-model="processingForm.workerId" 
              placeholder="请选择维修人员" 
              style="width: 100%"
              :rules="[{ required: true, message: '请选择维修人员', trigger: 'change' }]"
            >
              <el-option 
                v-for="worker in workerOptions" 
                :key="worker.value" 
                :label="worker.label" 
                :value="worker.value" 
              />
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="processingDialogVisible = false">取消</el-button>
          <el-button 
            :type="processingAction === 'approve' ? 'success' : processingAction === 'reject' ? 'danger' : 'info'" 
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
  buildingName: '',
  roomNumber: '',
  repairType: '',
  status: '',
  applyTimeRange: []
})

// 表格数据
const repairList = ref([])
const loading = ref(false)
const total = ref(0)
const activeStatus = ref('')

// 详情对话框
const detailVisible = ref(false)
const currentRepair = ref(null)

// 处理对话框
const processingDialogVisible = ref(false)
const processingAction = ref('') // 'approve', 'reject', 'complete'
const processingId = ref('')
const processingForm = reactive({
  comment: '',
  workerId: ''
})
const processingFormRef = ref(null)

// 维修人员选项
const workerOptions = ref([
  { label: '张维修（水电）', value: '1001' },
  { label: '李技工（家具）', value: '1002' },
  { label: '王师傅（设施）', value: '1003' }
])

// 计算属性
const processingTitle = computed(() => {
  if (processingAction.value === 'approve') {
    return '批准报修申请'
  } else if (processingAction.value === 'reject') {
    return '拒绝报修申请'
  } else {
    return '标记报修完成'
  }
})

// 获取报修列表
const getList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    setTimeout(() => {
      // 模拟数据
      repairList.value = [
        {
          repairId: 'R20230001',
          studentName: '张三',
          studentId: '20210101',
          buildingName: '梁园1号楼',
          roomNumber: '101',
          repairType: '水电',
          repairContent: '宿舍水龙头漏水，需要修理',
          applyTime: '2023-09-14 09:20',
          status: '0', // 待审批
          images: []
        },
        {
          repairId: 'R20230002',
          studentName: '李四',
          studentId: '20210102',
          buildingName: '梁园2号楼',
          roomNumber: '202',
          repairType: '家具',
          repairContent: '衣柜门把手损坏，无法正常使用',
          applyTime: '2023-09-15 14:10',
          status: '1', // 已批准
          processTime: '2023-09-15 16:30',
          comment: '已安排维修人员处理',
          workerId: '1002',
          images: []
        },
        {
          repairId: 'R20230003',
          studentName: '王五',
          studentId: '20210103',
          buildingName: '睢阳1号楼',
          roomNumber: '303',
          repairType: '设施',
          repairContent: '窗户无法关闭，需要维修',
          applyTime: '2023-09-16 10:20',
          status: '2', // 已拒绝
          processTime: '2023-09-16 14:15',
          comment: '请提供更详细的故障描述和照片',
          images: []
        },
        {
          repairId: 'R20230004',
          studentName: '赵六',
          studentId: '20210104',
          buildingName: '睢阳2号楼',
          roomNumber: '404',
          repairType: '水电',
          repairContent: '浴室灯泡损坏，需要更换',
          applyTime: '2023-09-12 08:30',
          status: '3', // 已完成
          processTime: '2023-09-12 11:45',
          completeTime: '2023-09-13 15:20',
          comment: '已安排维修人员更换灯泡',
          workerId: '1001',
          images: []
        }
      ]
      
      // 过滤状态
      if (activeStatus.value) {
        repairList.value = repairList.value.filter(item => item.status === activeStatus.value)
      }
      
      total.value = repairList.value.length
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取报修列表失败:', error)
    ElMessage.error('获取报修列表失败，请稍后重试')
    repairList.value = []
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
    buildingName: '',
    roomNumber: '',
    repairType: '',
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
  currentRepair.value = { ...row }
  detailVisible.value = true
}

// 批准
const handleApprove = (row) => {
  processingAction.value = 'approve'
  processingId.value = row.repairId
  processingForm.comment = ''
  processingForm.workerId = ''
  processingDialogVisible.value = true
}

// 拒绝
const handleReject = (row) => {
  processingAction.value = 'reject'
  processingId.value = row.repairId
  processingForm.comment = ''
  processingDialogVisible.value = true
}

// 标记完成
const handleComplete = (row) => {
  processingAction.value = 'complete'
  processingId.value = row.repairId
  processingForm.comment = `已于${new Date().toLocaleString()}完成维修`
  processingDialogVisible.value = true
}

// 提交处理
const submitProcessing = async () => {
  if (!processingFormRef.value) return
  
  await processingFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请完善表单信息')
      return
    }
    
    try {
      // 模拟API调用
      setTimeout(() => {
        let actionText = '处理'
        if (processingAction.value === 'approve') {
          actionText = '批准'
        } else if (processingAction.value === 'reject') {
          actionText = '拒绝'
        } else if (processingAction.value === 'complete') {
          actionText = '完成'
        }
        
        ElMessage.success(`已${actionText}报修申请`)
        processingDialogVisible.value = false
        
        // 关闭详情对话框
        detailVisible.value = false
        
        // 刷新列表
        getList()
      }, 500)
    } catch (error) {
      console.error('处理报修申请失败:', error)
      ElMessage.error('处理报修申请失败，请稍后重试')
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.repair-approval-container {
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
  
  .repair-image {
    width: 100px;
    height: 100px;
    margin-right: 8px;
    margin-bottom: 8px;
    border-radius: 4px;
    cursor: pointer;
  }
}
</style> 