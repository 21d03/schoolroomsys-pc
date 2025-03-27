<template>
  <div class="room-manage-container">
    <!-- 搜索过滤区域 -->
    <div class="filter-container">
      <el-card shadow="never">
        <div class="filter-form">
          <el-form :inline="true" :model="queryParams" ref="queryForm">
            <el-form-item label="宿舍楼" prop="buildName">
              <el-input v-model="queryParams.buildName" placeholder="请输入宿舍楼名称" clearable />
            </el-form-item>
            <el-form-item label="房间号" prop="roomId">
              <el-input v-model="queryParams.roomId" placeholder="请输入房间号" clearable />
            </el-form-item>
            <el-form-item label="房间类型" prop="roomType">
              <el-select v-model="queryParams.roomType" placeholder="请选择房间类型" clearable style="width: 120px">
                <el-option label="四人间" value="4" />
                <el-option label="六人间" value="6" />
                <el-option label="八人间" value="8" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否混寝" prop="isMixed">
              <el-select v-model="queryParams.isMixed" placeholder="请选择" clearable style="width: 120px">
                <el-option label="是" value="1" />
                <el-option label="否" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item label="使用状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px">
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

    <!-- 表格区域 -->
    <div class="table-container">
      <el-card shadow="never">
        <div class="table-header">
          <div class="table-title">房间列表</div>
          <div class="table-actions">
            <el-button type="primary" @click="handleAdd">新增房间</el-button>
          </div>
        </div>
        
        <el-table 
          :data="roomList" 
          border 
          v-loading="loading" 
          style="width: 100%"
        >
          <el-table-column prop="buildName" label="宿舍楼" min-width="180" align="center" />
          <el-table-column prop="roomId" label="房间号" min-width="120" align="center" />
          <el-table-column prop="roomType" label="房间类型" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.roomType + '人间' }}
            </template>
          </el-table-column>
          <el-table-column prop="currentStudentCount" label="当前人数" min-width="120" align="center" />
          <el-table-column prop="isMixed" label="是否混寝" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.isMixed === '1' ? '是' : '否' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="120" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
                {{ scope.row.status === '1' ? '正常使用' : '暂停使用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="280" align="center">
            <template #default="scope">
              <el-button type="primary" link @click="handleView(scope.row)">查看</el-button>
              <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
              <el-button 
                :type="scope.row.status === '1' ? 'warning' : 'success'" 
                link 
                @click="handleStatusChange(scope.row)"
              >
                {{ scope.row.status === '1' ? '暂停使用' : '恢复使用' }}
              </el-button>
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

    <!-- 添加/编辑房间对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="500px" 
      :close-on-click-modal="false"
    >
      <el-form 
        :model="roomForm" 
        :rules="roomRules" 
        ref="roomFormRef" 
        label-width="100px"
      >
        <el-form-item label="宿舍楼" prop="buildId">
          <el-select v-model="roomForm.buildId" placeholder="请选择宿舍楼" style="width: 100%" :disabled="isView">
            <el-option 
              v-for="item in buildingOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房间号" prop="roomId">
          <el-input v-model="roomForm.roomId" placeholder="请输入房间号" :disabled="isView" />
        </el-form-item>
        <el-form-item label="房间类型" prop="roomType">
          <el-select v-model="roomForm.roomType" placeholder="请选择房间类型" style="width: 100%" :disabled="isView">
            <el-option label="四人间" value="4" />
            <el-option label="六人间" value="6" />
            <el-option label="八人间" value="8" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否混寝" prop="isMixed">
          <el-radio-group v-model="roomForm.isMixed" :disabled="isView">
            <el-radio label="1">是</el-radio>
            <el-radio label="2">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ isView ? '关闭' : '取消' }}</el-button>
          <el-button v-if="!isView" type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 房间详情对话框 -->
    <el-dialog 
      title="房间详情" 
      v-model="detailDialogVisible" 
      width="700px"
    >
      <div class="room-detail">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="宿舍楼">{{ roomDetail.buildName }}</el-descriptions-item>
          <el-descriptions-item label="房间号">{{ roomDetail.roomId }}</el-descriptions-item>
          <el-descriptions-item label="房间类型">{{ roomDetail.roomType + '人间' }}</el-descriptions-item>
          <el-descriptions-item label="是否混寝">{{ roomDetail.isMixed === '1' ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="使用状态" :span="2">
            <el-tag :type="roomDetail.status === '1' ? 'success' : 'danger'">
              {{ roomDetail.status === '1' ? '正常使用' : '暂停使用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="students-title">
          <h3>入住学生信息</h3>
          <span>入住人数：{{ roomDetail.students?.length || 0 }}/{{ roomDetail.roomType }}</span>
        </div>
        
        <el-table v-if="roomDetail.students && roomDetail.students.length > 0" :data="roomDetail.students" border style="width: 100%">
          <el-table-column prop="studentName" label="姓名" width="100" align="center" />
          <el-table-column prop="studentSex" label="性别" width="80" align="center" />
          <el-table-column prop="bedNo" label="床位号" width="80" align="center" />
          <el-table-column prop="studentId" label="学号" width="120" align="center" />
          <el-table-column prop="studentPhone" label="联系电话" width="120" align="center" />
          <el-table-column prop="collegeName" label="所属学院" min-width="150" align="center" />
          <el-table-column prop="teacherName" label="辅导员" width="100" align="center" />
          <el-table-column prop="teacherPhone" label="辅导员电话" width="120" align="center" />
        </el-table>
        <el-empty v-else description="暂无入住学生" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑房间对话框 -->
    <el-dialog 
      title="编辑房间" 
      v-model="editDialogVisible" 
      width="500px" 
      :close-on-click-modal="false"
    >
      <el-form 
        :model="editForm" 
        :rules="editRules" 
        ref="editFormRef" 
        label-width="100px"
      >
        <el-form-item label="宿舍楼" prop="buildName">
          <el-input v-model="editForm.buildName" placeholder="请输入宿舍楼" disabled />
        </el-form-item>
        <el-form-item label="房间号" prop="roomId">
          <el-input v-model="editForm.roomId" placeholder="请输入房间号" disabled />
        </el-form-item>
        <el-form-item label="房间类型" prop="roomType">
          <el-select v-model="editForm.roomType" placeholder="请选择房间类型" style="width: 100%">
            <el-option label="四人间" value="4" />
            <el-option label="六人间" value="6" />
            <el-option label="八人间" value="8" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否混寝" prop="isMixed">
          <el-radio-group v-model="editForm.isMixed">
            <el-radio label="1">是</el-radio>
            <el-radio label="2">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  buildName: '',
  roomId: '',
  roomType: '',
  isMixed: '',
  status: '',
  manageTeacherName: ''
})

// 表格数据
const roomList = ref([])
const loading = ref(false)
const total = ref(0)

// 宿舍楼选项
const buildingOptions = ref([])
// 学院选项
const collegeOptions = ref([])
// 教师选项
const teacherOptions = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const roomForm = reactive({
  buildId: '',
  roomId: '',
  roomType: '4',
  isMixed: '2'
})

// 表单校验规则
const roomRules = {
  buildId: [
    { required: true, message: '请选择宿舍楼', trigger: 'change' }
  ],
  roomId: [
    { required: true, message: '请输入房间号', trigger: 'blur' },
    { pattern: /^\d{3,}$/, message: '房间号必须是3位以上数字', trigger: 'blur' }
  ],
  roomType: [
    { required: true, message: '请选择房间类型', trigger: 'change' }
  ],
  isMixed: [
    { required: true, message: '请选择是否混寝', trigger: 'change' }
  ]
}

// 表单引用
const roomFormRef = ref(null)
const queryForm = ref(null)

// 获取状态标签类型
const getStatusType = (status) => {
  const statusMap = {
    '0': 'success',
    '1': 'danger',
    '2': 'warning'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    '0': '空闲',
    '1': '已满',
    '2': '维修中'
  }
  return statusMap[status] || '未知'
}

// 获取房间列表
const getList = async () => {
  loading.value = true
  try {
    const response = await axios.post(
      'http://localhost:8080/SchoolRoomSys/school/room/build/room/page',
      queryParams,
      {
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token')
        }
      }
    )

    if (response.data.code === 200 || response.data.code === 1) {
      const { records, total: totalCount } = response.data.data
      roomList.value = records
      total.value = totalCount
    } else {
      ElMessage.error(response.data.msg || '获取房间列表失败')
    }
  } catch (error) {
    console.error('获取房间列表失败:', error)
    ElMessage.error('获取房间列表失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  Object.assign(queryParams, {
    buildName: '',
    roomId: '',
    roomType: '',
    isMixed: '',
    status: '',
    pageNum: 1,
    pageSize: 10
  })
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

// 添加房间
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增房间'
  isView.value = false
  dialogVisible.value = true
}

// 编辑房间
const handleEdit = (row) => {
  editForm.buildId = row.buildId
  editForm.roomId = row.roomId
  editForm.buildName = row.buildName
  editForm.roomType = row.roomType
  editForm.isMixed = row.isMixed
  editDialogVisible.value = true
}

// 删除房间
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除房间 ${row.roomId} 吗？删除后无法恢复，请谨慎操作。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      loading.value = true
      const response = await axios.delete(
        'http://localhost:8080/SchoolRoomSys/school/room/build/room/delete',
        {
          params: {
            buildId: row.buildId,
            roomId: row.roomId
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'token': localStorage.getItem('token')
          }
        }
      )

      if ((response.data.code === 0 || response.data.code === 1) && response.data.data === true) {
        ElMessage.success('删除成功')
        getList() // 刷新列表
      } else if (response.data.code === 1 && response.data.msg) {
        // 处理业务错误，如房间内有学生等情况
        ElMessage.warning(response.data.msg)
      } else if (response.status === 401) {
        ElMessage.error('未授权，请重新登录')
        // 可以在此处添加重定向到登录页的逻辑
      } else {
        ElMessage.error(response.data.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除房间失败:', error)
      if (error.response) {
        if (error.response.status === 401) {
          ElMessage.error('未授权，请重新登录')
        } else if (error.response.status === 500) {
          ElMessage.error('服务器错误或参数错误')
        } else {
          ElMessage.error(error.response.data?.msg || '删除失败')
        }
      } else {
        ElMessage.error('网络错误，请稍后重试')
      }
    } finally {
      loading.value = false
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
  Object.assign(roomForm, {
    buildId: '',
    roomId: '',
    roomType: '4',
    isMixed: '2'
  })
  roomFormRef.value?.resetFields()
}

// 提交表单
const submitForm = async () => {
  roomFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const params = {
          buildId: roomForm.buildId,
          layerNumber: roomForm.roomId.substring(0, 1), // 从房间号中提取楼层
          roomId: roomForm.roomId,
          isMixed: roomForm.isMixed,
          roomType: roomForm.roomType,
          status: '1' // 默认正常使用
        }

        const response = await axios.post(
          'http://localhost:8080/SchoolRoomSys/school/room/build/room/add',
          params,
          {
            headers: {
              'Content-Type': 'application/json',
              'token': localStorage.getItem('token')
            }
          }
        )

        if ((response.data.code === 0 || response.data.code === 1) && response.data.data === true) {
          ElMessage.success(dialogTitle.value === '新增房间' ? '添加成功' : '更新成功')
          dialogVisible.value = false
          getList()
        } else {
          // 显示后端返回的错误信息
          ElMessage.error(response.data.msg || '操作失败')
        }
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error(error.response?.data?.msg || '操作失败')
      }
    }
  })
}

// 状态变更
const handleStatusChange = (row) => {
  const statusText = row.status === '1' ? '暂停使用' : '恢复使用'
  const confirmText = row.status === '1' ? 
    `确定要暂停使用房间 ${row.roomId} 吗？` : 
    `确定要恢复使用房间 ${row.roomId} 吗？`
  
  ElMessageBox.confirm(
    confirmText,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: row.status === '1' ? 'warning' : 'info'
    }
  ).then(async () => {
    try {
      const response = await axios.put(
        'http://localhost:8080/SchoolRoomSys/school/room/build/room/status',
        null,
        {
          params: {
            buildId: row.buildId,
            roomId: row.roomId,
            status: row.status === '1' ? '0' : '1'
          },
          headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token')
          }
        }
      )

      // 检查响应状态和消息
      if (response.data.code === 0 && response.data.data === true) {
        ElMessage.success(`${statusText}成功`)
        getList()
      } else {
        // 即使 code 为 1 但有 msg，也显示为警告信息
        if (response.data.msg) {
          ElMessage.warning(response.data.msg)
        } else {
          ElMessage.error(`${statusText}失败`)
        }
      }
    } catch (error) {
      console.error(`${statusText}失败:`, error)
      ElMessage.error(`${statusText}失败: ` + (error.response?.data?.msg || '未知错误'))
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消操作'
    })
  })
}

// 查看房间
const handleView = async (row) => {
  try {
    loading.value = true
    const response = await axios.get(
      'http://localhost:8080/SchoolRoomSys/school/room/build/room/detail',
      {
        params: {
          buildId: row.buildId,
          roomId: row.roomId
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': localStorage.getItem('token')
        }
      }
    )

    if ((response.data.code === 0 || response.data.code === 1) && response.data.data) {
      roomDetail.value = response.data.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(response.data.message || response.data.msg || '获取房间详情失败')
    }
  } catch (error) {
    console.error('获取房间详情失败:', error)
    if (error.response) {
      if (error.response.status === 401) {
        ElMessage.error('未授权，请重新登录')
      } else if (error.response.status === 500) {
        ElMessage.error('服务器错误或参数错误')
      } else {
        ElMessage.error(error.response.data?.message || error.response.data?.msg || '获取房间详情失败')
      }
    } else {
      ElMessage.error('网络错误，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 在 script setup 中添加 isView 变量
const isView = ref(false)

// 房间详情相关
const detailDialogVisible = ref(false)
const roomDetail = ref({
  buildName: '',
  roomId: '',
  roomType: '',
  isMixed: '',
  status: '',
  manageTeacherName: '',
  collegeNames: '',
  students: []
})

// 获取宿舍楼列表
const getBuildingList = async () => {
  try {
    const response = await axios.post(
      'http://localhost:8080/SchoolRoomSys/school/room/build/page',
      {
        pageNum: 1,
        pageSize: 999, // 设置较大的数值以获取所有数据
        // status: '1', // 只获取正常使用的宿舍楼
        isUsed: '1' // 添加参数，只获取正常使用的宿舍楼
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token')
        }
      }
    )

    if (response.data.code === 200 || response.data.code === 1) {
      const { records } = response.data.data
      buildingOptions.value = records.map(item => ({
        label: item.buildName,
        value: item.buildId
      }))
    } else {
      ElMessage.error(response.data.msg || '获取宿舍楼列表失败')
    }
  } catch (error) {
    console.error('获取宿舍楼列表失败:', error)
    ElMessage.error('获取宿舍楼列表失败')
  }
}

// 编辑房间相关
const editDialogVisible = ref(false)
const editForm = reactive({
  buildId: '',
  roomId: '',
  buildName: '',
  roomType: '',
  isMixed: ''
})

// 编辑表单验证规则
const editRules = {
  roomType: [
    { required: true, message: '请选择房间类型', trigger: 'change' }
  ],
  isMixed: [
    { required: true, message: '请选择是否混寝', trigger: 'change' }
  ]
}

const editFormRef = ref(null)

// 提交编辑表单
const submitEditForm = async () => {
  editFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const params = {
          buildId: editForm.buildId,
          roomId: editForm.roomId,
          roomType: editForm.roomType,
          isMixed: editForm.isMixed
        }

        const response = await axios.put(
          'http://localhost:8080/SchoolRoomSys/school/room/build/room/update',
          params,
          {
            headers: {
              'Content-Type': 'application/json',
              'token': localStorage.getItem('token')
            }
          }
        )

        if ((response.data.code === 0 || response.data.code === 1) && response.data.data === true) {
          ElMessage.success('更新成功')
          editDialogVisible.value = false
          getList()
        } else {
          // 显示后端返回的错误信息
          ElMessage.error(response.data.msg || '操作失败')
        }
      } catch (error) {
        console.error('更新房间失败:', error)
        ElMessage.error(error.response?.data?.msg || '更新失败')
      }
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  getList()
  getBuildingList() // 获取宿舍楼列表
})
</script>

<style lang="scss" scoped>
.room-manage-container {
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

  .room-detail {
    .students-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 20px 0 10px;
      
      h3 {
        margin: 0;
      }
    }
  }
}
</style>
