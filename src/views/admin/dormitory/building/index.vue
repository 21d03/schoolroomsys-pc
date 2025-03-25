<template>
  <div class="building-manage-container">
    <div class="filter-container">
      <el-card shadow="never">
        <div class="filter-form">
          <el-form :inline="true" :model="queryParams" ref="queryForm">
            <el-form-item label="楼栋名称" prop="buildName">
              <el-input v-model="queryParams.buildName" placeholder="请输入楼栋名称" clearable />
            </el-form-item>
            <el-form-item label="状态" prop="isUsed" style="width: 220px;">
              <el-select v-model="queryParams.isUsed" placeholder="选择状态" clearable style="width: 100%">
                <el-option label="正常使用" value="1" />
                <el-option label="暂停使用" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>

    <div class="table-container">
      <el-card shadow="never">
        <div class="table-header">
          <div class="table-title">宿舍楼列表</div>
          <div class="table-actions">
            <el-button type="primary" @click="handleAdd">新增宿舍楼</el-button>
          </div>
        </div>
        
        <el-table 
          :data="buildingList" 
          border 
          v-loading="loading" 
          style="width: 100%"
        >
          <el-table-column prop="buildingId" label="楼栋编号" width="120" align="center" />
          <el-table-column prop="buildingName" label="楼栋名称" width="120" align="center" />
          <el-table-column prop="floorCount" label="楼层数" width="80" align="center" />
          <el-table-column prop="roomCount" label="房间数" width="80" align="center" />
          <el-table-column prop="managerName" label="负责宿管" width="100" align="center" />
          <el-table-column prop="usedCount" label="入住率" min-width="150" align="center">
            <template #default="scope">
              <el-progress 
                :percentage="parseFloat(scope.row.occupancyRate?.replace('%', '') || 0)" 
                :color="getOccupancyColor(scope.row.occupancyRate)"
                :format="() => scope.row.occupancyRate || '0%'"
              />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
                {{ scope.row.status === '1' ? '正常使用' : '暂停使用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="scope">
              <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 添加/编辑宿舍楼对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="500px" 
      :close-on-click-modal="false"
    >
      <el-form 
        :model="buildingForm" 
        :rules="buildingRules" 
        ref="buildingFormRef" 
        label-width="100px"
      >
        <el-form-item label="楼栋编号" prop="buildId">
          <el-input v-model="buildingForm.buildId" placeholder="请输入楼栋编号" />
        </el-form-item>
        <el-form-item label="楼栋名称" prop="buildName">
          <el-input v-model="buildingForm.buildName" placeholder="请输入楼栋名称" />
        </el-form-item>
        <el-form-item label="负责宿管" prop="hmId">
          <el-select 
            v-model="buildingForm.hmId" 
            placeholder="请选择宿管" 
            filterable 
            style="width: 100%"
          >
            <el-option 
              v-for="item in managerOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            >
              <span>{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属校区" prop="campus">
          <el-select v-model="buildingForm.campus" placeholder="请选择校区">
            <el-option label="梁园校区" value="1" />
            <el-option label="睢阳校区" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼层数" prop="layerNumber">
          <el-input-number v-model="buildingForm.layerNumber" :min="1" :max="30" />
        </el-form-item>
        <el-form-item label="房间总数" prop="totalRoomNum">
          <el-input-number v-model="buildingForm.totalRoomNum" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="宿舍楼类型" prop="buildType">
          <el-select v-model="buildingForm.buildType" placeholder="请选择宿舍楼类型">
            <el-option label="男寝" value="1" />
            <el-option label="女寝" value="2" />
            <el-option label="混合" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="使用状态" prop="isUsed">
          <el-radio-group v-model="buildingForm.isUsed">
            <el-radio label="1">正常使用</el-radio>
            <el-radio label="0">暂停使用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="buildingForm.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getBuildingList,
  addBuilding,
  updateBuilding,
  deleteBuilding,
  getDormManagers
} from '@/api/building'
import axios from 'axios'  // 导入axios

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  buildName: '',
  isUsed: ''
})

// 表格数据
const buildingList = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 宿管选项
const managerOptions = ref([
  { value: '1001', label: '张红霞' },
  { value: '1002', label: '李明' },
  { value: '1003', label: '王芳' }
])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const buildingForm = reactive({
  buildId: '',
  buildName: '',
  hmId: '',
  campus: '1',
  layerNumber: 6,
  totalRoomNum: 240,
  buildType: '1',
  isUsed: '1',
  remark: '',
  roomDetails: []
})

// 表单校验规则
const buildingRules = {
  buildId: [
    { required: true, message: '请输入楼栋编号', trigger: 'blur' },
    { pattern: /^\d+$/, message: '楼栋编号只能是数字', trigger: 'blur' }
  ],
  buildName: [
    { required: true, message: '请输入楼栋名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  hmId: [
    { required: true, message: '请选择负责宿管', trigger: 'change' }
  ],
  campus: [
    { required: true, message: '请选择校区', trigger: 'change' }
  ],
  layerNumber: [
    { required: true, message: '请输入楼层数', trigger: 'change' }
  ],
  totalRoomNum: [
    { required: true, message: '请输入房间总数', trigger: 'change' }
  ],
  buildType: [
    { required: true, message: '请选择宿舍楼类型', trigger: 'change' }
  ],
  isUsed: [
    { required: true, message: '请选择使用状态', trigger: 'change' }
  ]
}

// 表单引用
const buildingFormRef = ref(null)
const queryForm = ref(null)

// 获取入住率颜色
const getOccupancyColor = (occupancyRate) => {
  // 解析入住率百分比
  const rate = parseFloat(occupancyRate?.replace('%', '') || 0)
  if (rate < 50) return '#67c23a'
  if (rate < 80) return '#e6a23c'
  return '#f56c6c'
}

// 获取宿管列表
const fetchDormManagers = async () => {
  try {
    const response = await axios.get('http://localhost:8080/SchoolRoomSys/school/house-master/unassigned', {
      headers: {
        'Content-Type': 'application/json',
        'token': localStorage.getItem('token')
      }
    })

    if (response.data.code === 1) {
      // 将后端返回的宿管数据转换为选项格式
      managerOptions.value = response.data.data.map(item => ({
        value: item.hmId,
        label: `${item.hmName}（${item.hmPhone}）` // 显示姓名和电话
      }))
      console.log('获取到的宿管列表:', managerOptions.value)
    } else {
      ElMessage.error(response.data.msg || '获取宿管列表失败')
    }
  } catch (error) {
    console.error('获取宿管列表失败:', error)
    ElMessage.error('获取宿管列表失败')
  }
}

// 获取宿舍楼列表
const getList = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      buildName: queryParams.buildName,
      isUsed: queryParams.isUsed
    }

    // 直接使用axios发送请求
    const response = await axios.post('http://localhost:8080/SchoolRoomSys/school/room/build/page', params, {
      headers: {
        'Content-Type': 'application/json',
        'token': localStorage.getItem('token')
      }
    })
    
    const res = response.data
    console.log('接口返回数据:', res)
    
    if (res.code === 1 && res.data && res.data.records) {
      // 处理后端返回的数据
      buildingList.value = res.data.records.map(item => ({
        id: item.buildId,
        buildingId: item.buildId,
        buildingName: item.buildName,
        floorCount: parseInt(item.layerNumber),
        roomCount: parseInt(item.totalRoomNum),
        usedCount: calculateUsedCount(item.totalRoomNum, item.occupancyRate),
        managerName: item.hmName,
        managerId: '', // 后端暂未提供
        status: item.isUsed,
        occupancyRate: item.occupancyRate || '0%',
        remark: '' // 后端暂未提供
      }))
      total.value = res.data.total
    } else {
      buildingList.value = []
      total.value = 0
      ElMessage.error(res.msg || '获取宿舍楼列表失败')
    }
    loading.value = false
  } catch (error) {
    console.error('获取宿舍楼列表失败:', error)
    loading.value = false
    ElMessage.error('获取宿舍楼列表失败')
  }
}

// 根据入住率计算已使用房间数
const calculateUsedCount = (totalRooms, occupancyRate) => {
  if (!totalRooms || !occupancyRate) return 0
  const rate = parseFloat(occupancyRate?.replace('%', '') || 0) / 100
  return Math.round(parseInt(totalRooms) * rate)
}

// 查询
const handleQuery = () => {
  currentPage.value = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryForm.value?.resetFields()
  handleQuery()
}

// 处理页面大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  getList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  getList()
}

// 添加宿舍楼
const handleAdd = async () => {
  resetForm()
  dialogTitle.value = '新增宿舍楼'
  // 打开对话框前先获取最新的宿管列表
  await fetchDormManagers()
  dialogVisible.value = true
}

// 编辑宿舍楼
const handleEdit = (row) => {
  resetForm()
  dialogTitle.value = '编辑宿舍楼'
  Object.assign(buildingForm, {
    id: row.id,
    buildingName: row.buildingName,
    floorCount: row.floorCount,
    managerId: row.managerId,
    status: row.status,
    remark: row.remark
  })
  dialogVisible.value = true
}

// 删除宿舍楼
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除宿舍楼 ${row.buildingName} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 调用删除接口
      const response = await axios.delete(
        `http://localhost:8080/SchoolRoomSys/school/room/build/delete/${row.buildingId}`,
        {
          headers: {
            'token': localStorage.getItem('token')
          }
        }
      )

      if (response.data.code === 1) {
        ElMessage({
          type: 'success',
          message: '删除成功'
        })
        // 刷新列表
        getList()
      } else {
        ElMessage({
          type: 'error',
          message: response.data.msg || '删除失败'
        })
      }
    } catch (error) {
      console.error('删除宿舍楼失败:', error)
      ElMessage({
        type: 'error',
        message: '删除失败: ' + (error.response?.data?.msg || '未知错误')
      })
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除'
    })
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(buildingForm, {
    buildId: '',
    buildName: '',
    hmId: '',
    campus: '1',
    layerNumber: 6,
    totalRoomNum: 240,
    buildType: '1',
    isUsed: '1',
    remark: '',
    roomDetails: []
  })
  buildingFormRef.value?.resetFields()
}

// 提交表单
const submitForm = async () => {
  buildingFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        // 构建房间详情数据
        const roomDetails = []
        const baseRoomNum = parseInt(buildingForm.totalRoomNum) / parseInt(buildingForm.layerNumber)
        
        for (let floor = 1; floor <= buildingForm.layerNumber; floor++) {
          for (let room = 1; room <= baseRoomNum; room++) {
            const roomId = `${buildingForm.buildId}${floor.toString().padStart(2, '0')}${room.toString().padStart(2, '0')}`
            roomDetails.push({
              roomId,
              isMixed: "2", // 默认不混寝
              collegeIds: "05", // 默认学院ID
              manageTeacherId: "0500001", // 默认管理教师ID
              roomType: "4" // 默认4人间
            })
          }
        }

        const formData = {
          buildId: buildingForm.buildId,
          buildName: buildingForm.buildName,
          hmId: buildingForm.hmId,
          campus: buildingForm.campus,
          layerNumber: buildingForm.layerNumber.toString(),
          totalRoomNum: buildingForm.totalRoomNum.toString(),
          buildType: buildingForm.buildType,
          isUsed: buildingForm.isUsed,
          remark: buildingForm.remark,
          roomDetails
        }

        // 发送请求
        const response = await axios.post(
          'http://localhost:8080/SchoolRoomSys/school/room/build/add',
          formData,
          {
            headers: {
              'Content-Type': 'application/json',
              'token': localStorage.getItem('token')
            }
          }
        )

        if (response.data.code === 1) {
          ElMessage.success('添加成功')
          dialogVisible.value = false
          getList()
        } else {
          ElMessage.error(response.data.msg || '添加失败')
        }
      } catch (error) {
        console.error('添加宿舍楼失败:', error)
        ElMessage.error('添加失败')
      }
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  getList()
  fetchDormManagers()
})
</script>

<style lang="scss" scoped>
.building-manage-container {
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
}
</style> 