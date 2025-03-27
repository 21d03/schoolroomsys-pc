<template>
  <div class="student-manage-container">
    <!-- 搜索过滤区域 -->
    <div class="filter-container">
      <el-card shadow="never">
        <div class="filter-form">
          <el-form :inline="true" :model="queryParams" ref="queryForm">
            <el-form-item label="学号" prop="stuId">
              <el-input v-model="queryParams.stuId" placeholder="请输入学号" clearable />
            </el-form-item>
            <el-form-item label="姓名" prop="stuName">
              <el-input v-model="queryParams.stuName" placeholder="请输入姓名" clearable />
            </el-form-item>
            <el-form-item label="所属学院" prop="college">
              <el-select v-model="queryParams.college" placeholder="请选择学院" clearable style="width: 180px">
                <el-option 
                  v-for="item in collegeOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="性别" prop="sex">
              <el-select v-model="queryParams.sex" placeholder="请选择性别" clearable style="width: 120px">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
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
          <div class="table-title">学生列表</div>
          <div class="table-actions">
            <el-button type="primary" @click="handleAdd">新增学生</el-button>
          </div>
        </div>
        
        <el-table 
          :data="studentList" 
          border 
          v-loading="loading" 
          style="width: 100%"
        >
          <el-table-column prop="stuId" label="学号" min-width="120" align="center" />
          <el-table-column prop="stuName" label="姓名" min-width="100" align="center" />
          <el-table-column prop="sex" label="性别" width="80" align="center" />
          <el-table-column prop="college" label="所属学院" min-width="150" align="center" />
          <el-table-column label="班级" min-width="120" align="center">
            <template #default="scope">
              {{ scope.row.profession && scope.row.classRoom ? `${scope.row.profession}${scope.row.classRoom}` : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="联系电话" min-width="120" align="center" />
          <el-table-column prop="teacherName" label="辅导员" min-width="100" align="center" />
          <el-table-column label="宿舍信息" min-width="150" align="center">
            <template #default="scope">
              {{ scope.row.buildId && scope.row.roomId ? `${scope.row.buildId}号楼-${scope.row.roomId}` : '未分配' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="160" align="center" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="handleView(scope.row)">查看</el-button>
              <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 添加/编辑学生对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="700px" 
      append-to-body 
      destroy-on-close
    >
      <el-form 
        ref="studentFormRef" 
        :model="studentForm" 
        :rules="studentRules" 
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学号" prop="stuId">
              <el-input v-model="studentForm.stuId" placeholder="请输入学号" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="stuName">
              <el-input v-model="studentForm.stuName" placeholder="请输入姓名" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-select v-model="studentForm.sex" placeholder="请选择性别" style="width: 100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="studentForm.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属学院" prop="college">
              <el-select v-model="studentForm.college" placeholder="请选择学院" style="width: 100%" @change="handleCollegeChange">
                <el-option 
                  v-for="item in collegeOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="专业" prop="profession">
              <el-input v-model="studentForm.profession" placeholder="请输入专业" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级" prop="classRoom">
              <el-input v-model="studentForm.classRoom" placeholder="请输入班级" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="辅导员" prop="teacherId">
              <el-select 
                v-model="studentForm.teacherId" 
                placeholder="请选择辅导员" 
                style="width: 100%"
                filterable
                @focus="loadTeachers"
                @change="handleTeacherChange"
              >
                <el-option 
                  v-for="item in teacherOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                >
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>{{ item.label }}</span>
                    <span style="color: #999; font-size: 12px;">{{ item.college }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="辅导员姓名" prop="teacherName" v-show="false">
              <el-input v-model="studentForm.teacherName" placeholder="请输入辅导员姓名" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="宿舍楼" prop="buildId">
              <el-select v-model="studentForm.buildId" placeholder="请选择宿舍楼" style="width: 100%" @change="handleBuildingChange">
                <el-option 
                  v-for="item in buildingOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="房间号" prop="roomId">
              <el-input v-model="studentForm.roomId" placeholder="请输入房间号" maxlength="10" @change="handleRoomIdChange" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="床位号" prop="bedNo">
              <el-select v-model="studentForm.bedNo" placeholder="请选择床位号" style="width: 100%">
                <el-option 
                  v-for="item in bedOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelForm">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 学生详情对话框 (后续实现) -->
    
    <!-- 学生入住对话框 (后续实现) -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  stuId: '',
  stuName: '',
  college: '',
  sex: ''
})

// 表格数据
const studentList = ref([])
const loading = ref(false)
const total = ref(0)

// 学院选项
const collegeOptions = ref([])

// 宿舍楼选项
const buildingOptions = ref([])

// 辅导员选项
const teacherOptions = ref([])

// 床位选项
const bedOptions = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增学生')
const studentFormRef = ref(null)

// 学生表单数据
const studentForm = reactive({
  stuId: '',
  stuName: '',
  sex: '',
  phone: '',
  college: '',
  profession: '',
  classRoom: '',
  teacherId: '',
  teacherName: '',
  buildId: '',
  roomId: '',
  bedNo: ''
})

// 表单验证规则
const studentRules = {
  stuId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^\d{4,15}$/, message: '学号必须为4-15位数字', trigger: 'blur' }
  ],
  stuName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  college: [
    { required: true, message: '请选择所属学院', trigger: 'change' }
  ],
  profession: [
    { required: true, message: '请输入专业', trigger: 'blur' }
  ],
  classRoom: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ],
  teacherId: [
    { required: true, message: '请输入辅导员ID', trigger: 'blur' }
  ],
  teacherName: [
    { required: true, message: '请输入辅导员姓名', trigger: 'blur' }
  ],
  buildId: [
    { required: true, message: '请选择宿舍楼', trigger: 'change' }
  ],
  roomId: [
    { required: true, message: '请输入房间号', trigger: 'blur' }
  ],
  bedNo: [
    { required: true, message: '请选择床位号', trigger: 'change' }
  ]
}

// 获取学生列表
const getList = async () => {
  loading.value = true
  try {
    const response = await request({
      url: '/school/student/page',
      method: 'post',
      data: queryParams
    })
    
    const { code, msg, data } = response.data
    
    if ((code === 0 || code === 1) && data) {
      studentList.value = data.records || []
      total.value = data.total || 0
    } else {
      ElMessage.error(msg || '获取学生列表失败')
      studentList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败，请稍后重试')
    studentList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 获取学院列表
const getCollegeList = async () => {
  try {
    const response = await request({
      url: '/school/college/list',
      method: 'get'
    })
    
    const { code, msg, data } = response.data
    
    if ((code === 0 || code === 1) && data) {
      collegeOptions.value = data.map(item => ({
        label: item.collegeName,
        value: item.collegeName
      }))
    } else {
      ElMessage.error(msg || '获取学院列表失败')
      collegeOptions.value = []
    }
  } catch (error) {
    console.error('获取学院列表失败:', error)
    ElMessage.error('获取学院列表失败，请稍后重试')
    collegeOptions.value = []
  }
}

// 获取宿舍楼列表
const getBuildingList = async () => {
  try {
    const response = await request({
      url: '/school/room/build/page',
      method: 'post',
      data: {
        pageNum: 1,
        pageSize: 999,
        status: '1',
        isUsed: '1'
      }
    })
    
    const { code, msg, data } = response.data
    
    if ((code === 0 || code === 1) && data) {
      buildingOptions.value = data.records.map(item => ({
        label: `${item.buildId}号楼`,
        value: item.buildId
      }))
    } else {
      ElMessage.error(msg || '获取宿舍楼列表失败')
      buildingOptions.value = []
    }
  } catch (error) {
    console.error('获取宿舍楼列表失败:', error)
    ElMessage.error('获取宿舍楼列表失败，请稍后重试')
    buildingOptions.value = []
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
    stuId: '',
    stuName: '',
    college: '',
    sex: '',
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

// 添加学生
const handleAdd = () => {
  dialogTitle.value = '新增学生'
  dialogVisible.value = true
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.assign(studentForm, {
    stuId: '',
    stuName: '',
    sex: '',
    phone: '',
    college: '',
    profession: '',
    classRoom: '',
    teacherId: '',
    teacherName: '',
    buildId: '',
    roomId: '',
    bedNo: ''
  })
  
  // 如果表单引用存在，重置校验状态
  studentFormRef.value?.resetFields()
}

// 取消表单
const cancelForm = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const submitForm = async () => {
  if (!studentFormRef.value) return
  
  await studentFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请正确填写所有必填项')
      return
    }
    
    try {
      const response = await request({
        url: '/school/student/add',
        method: 'post',
        data: studentForm
      })
      
      const { code, msg } = response.data
      
      if (code === 0) {
        ElMessage.success('新增学生成功')
        dialogVisible.value = false
        getList() // 刷新学生列表
      } else {
        ElMessage.error(msg || '新增学生失败')
      }
    } catch (error) {
      console.error('新增学生失败:', error)
      if (error.response) {
        ElMessage.error(error.response.data?.msg || '新增学生失败')
      } else {
        ElMessage.error('新增学生失败，请稍后重试')
      }
    }
  })
}

// 编辑学生
const handleEdit = (row) => {
  ElMessage.info(`编辑学生 ${row.stuName} 功能待实现`)
}

// 查看学生详情
const handleView = (row) => {
  ElMessage.info(`查看学生 ${row.stuName} 详情功能待实现`)
}

// 删除学生
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除学生 ${row.stuName} 吗？删除后无法恢复，请谨慎操作。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.info(`删除学生 ${row.stuName} 功能待实现`)
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除'
    })
  })
}

// 入住/退宿
const handleCheckInOut = (row) => {
  const actionText = row.buildId && row.roomId ? '退宿' : '入住'
  ElMessage.info(`学生 ${row.stuName} ${actionText}功能待实现`)
}

// 批量导入
const handleImport = () => {
  ElMessage.info('批量导入功能待实现')
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出数据功能待实现')
}

// 学院变更处理
const handleCollegeChange = async (value) => {
  // 清空辅导员相关字段
  studentForm.teacherId = ''
  studentForm.teacherName = ''
  
  // 如果选择了学院，加载该学院的辅导员
  if (value) {
    await loadTeachers(value)
  }
}

// 加载辅导员列表
const loadTeachers = async (college) => {
  try {
    const params = {}
    
    // 如果有传入学院或者表单中已选择学院，按学院筛选
    if (college) {
      params.college = typeof college === 'string' ? college : studentForm.college
    }
    
    const response = await request({
      url: '/school/teacher/list',
      method: 'post',
      data: params
    })
    
    const { code, data } = response.data
    
    if ((code === 0 || code === 1) && data) {
      teacherOptions.value = data.map(item => ({
        label: item.name || item.teacherName,
        value: item.teacherId,
        college: item.college,
        teacherName: item.name || item.teacherName,
        ...item
      }))
    } else {
      teacherOptions.value = []
    }
  } catch (error) {
    console.error('获取辅导员列表失败:', error)
    ElMessage.error('获取辅导员列表失败，请稍后重试')
    teacherOptions.value = []
  }
}

// 辅导员选择变更
const handleTeacherChange = (value) => {
  if (!value) return
  
  // 从选项中查找选中的辅导员完整信息
  const selectedTeacher = teacherOptions.value.find(item => item.value === value)
  
  if (selectedTeacher) {
    // 回填辅导员姓名（使用name或teacherName）
    studentForm.teacherName = selectedTeacher.name || selectedTeacher.teacherName
    
    // 如果学院未选择或不匹配，回填学院
    if (!studentForm.college || studentForm.college !== selectedTeacher.college) {
      studentForm.college = selectedTeacher.college
    }
  }
}

// 宿舍楼变更处理
const handleBuildingChange = () => {
  // 清空房间号和床位号相关字段
  studentForm.roomId = ''
  studentForm.bedNo = ''
  // 清空床位选项
  bedOptions.value = []
}

// 房间号变更处理
const handleRoomIdChange = async () => {
  // 清空床位号
  studentForm.bedNo = ''
  
  // 如果宿舍楼和房间号都有值，查询房间类型
  if (studentForm.buildId && studentForm.roomId) {
    await getRoomType()
  } else {
    // 清空床位选项
    bedOptions.value = []
  }
}

// 获取房间类型
const getRoomType = async () => {
  try {
    const response = await request({
      url: `/school/room/build/room/type`,
      method: 'get',
      params: {
        buildId: studentForm.buildId,
        roomId: studentForm.roomId
      }
    })
    
    const { code, msg, data } = response.data
    
    if ((code === 0 || code === 1) && data) {
      // 生成床位选项
      generateBedOptions(data.roomType)
    } else {
      ElMessage.warning(msg || '未找到该宿舍信息')
      bedOptions.value = []
    }
  } catch (error) {
    console.error('获取房间类型失败:', error)
    ElMessage.error('获取房间类型失败，请稍后重试')
    bedOptions.value = []
  }
}

// 生成床位选项
const generateBedOptions = (roomType) => {
  // 房间类型表示几人间
  const bedCount = parseInt(roomType) || 0
  
  if (bedCount > 0) {
    // 生成1-n的床位选项
    bedOptions.value = Array.from({ length: bedCount }, (_, i) => {
      const num = i + 1
      const value = num < 10 ? `0${num}` : `${num}` // 01, 02, ..., 10
      return {
        label: `${num}号床`,
        value: value
      }
    })
  } else {
    bedOptions.value = []
    ElMessage.warning('房间类型无效，无法生成床位选项')
  }
}

// 页面加载时获取数据
onMounted(() => {
  getList()
  getCollegeList()
  getBuildingList()
})
</script>

<style lang="scss" scoped>
.student-manage-container {
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