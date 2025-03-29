<template>
  <div class="teacher-manage-container">
    <!-- 搜索过滤区域 -->
    <div class="filter-container">
      <el-card shadow="never">
        <div class="filter-form">
          <el-form :inline="true" :model="queryParams" ref="queryForm">
            <el-form-item label="工号" prop="teacherId">
              <el-input v-model="queryParams.teacherId" placeholder="请输入工号" clearable />
            </el-form-item>
            <el-form-item label="姓名" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入姓名" clearable />
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
          <div class="table-title">教师列表</div>
          <div class="table-actions">
            <el-button type="primary" @click="handleAdd">新增教师</el-button>
          </div>
        </div>
        
        <el-table 
          :data="teacherList" 
          border 
          v-loading="loading" 
          style="width: 100%"
        >
          <el-table-column prop="teacherId" label="工号" min-width="120" align="center" />
          <el-table-column prop="name" label="姓名" min-width="100" align="center" />
          <el-table-column prop="sex" label="性别" width="80" align="center" />
          <el-table-column prop="phone" label="联系电话" min-width="120" align="center" />
          <el-table-column prop="college" label="所属学院" min-width="150" align="center" />
          <el-table-column label="分管班级" min-width="180" align="center">
            <template #default="scope">
              <span v-if="scope.row.classes">{{ scope.row.classes }}</span>
              <span v-else>未分配</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="240" align="center" fixed="right">
            <template #default="scope">
              <template v-if="scope.row.teacherId && scope.row.teacherId.startsWith('00')">
                <span style="color: #909399;">学校管理员，不可操作</span>
              </template>
              <template v-else>
                <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
                <el-button type="success" link @click="handleAssignClass(scope.row)">分配班级</el-button>
                <el-button 
                  v-if="scope.row.classes" 
                  type="warning" 
                  link 
                  @click="handleCancelClass(scope.row)"
                >
                  取消分配班级
                </el-button>
                <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 添加教师对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="700px" 
      append-to-body 
      destroy-on-close
    >
      <el-form 
        ref="teacherFormRef" 
        :model="teacherForm" 
        :rules="teacherRules" 
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工号" prop="teacherId">
              <el-input 
                v-model="teacherForm.teacherId" 
                placeholder="请输入工号" 
                maxlength="20"
                @blur="handleTeacherIdChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="teacherForm.name" placeholder="请输入姓名" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-select v-model="teacherForm.sex" placeholder="请选择性别" style="width: 100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="teacherForm.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属学院" prop="college">
              <el-input 
                v-model="teacherForm.college" 
                placeholder="请先输入工号" 
                readonly 
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账号状态" prop="isUsed">
              <el-select v-model="teacherForm.isUsed" placeholder="请选择状态" style="width: 100%">
                <el-option label="启用" value="1" />
                <el-option label="禁用" value="0" />
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

    <!-- 编辑教师对话框 -->
    <el-dialog 
      title="编辑教师" 
      v-model="editDialogVisible" 
      width="600px" 
      append-to-body 
      destroy-on-close
    >
      <el-form 
        ref="editFormRef" 
        :model="editForm" 
        :rules="editRules" 
        label-width="100px"
      >
        <el-form-item label="工号" prop="teacherId">
          <el-input v-model="editForm.teacherId" disabled class="is-disabled" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" disabled class="is-disabled" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-input v-model="editForm.sex" disabled class="is-disabled" />
        </el-form-item>
        <el-form-item label="所属学院" prop="college">
          <el-input v-model="editForm.college" disabled class="is-disabled" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入联系电话" maxlength="11" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEditForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配班级对话框 -->
    <el-dialog 
      title="分配班级" 
      v-model="assignClassDialogVisible" 
      width="700px" 
      append-to-body 
      destroy-on-close
    >
      <div v-if="assignClassLoading" class="assign-loading">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else>
        <div class="teacher-info-box">
          <div class="info-title">教师信息</div>
          <div class="info-content">
            <div class="info-item">
              <span class="info-label">工号：</span>
              <span class="info-value">{{ currentTeacher.teacherId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">姓名：</span>
              <span class="info-value">{{ currentTeacher.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">学院：</span>
              <span class="info-value">{{ currentTeacher.college }}</span>
            </div>
          </div>
        </div>
        
        <div class="current-classes-box">
          <div class="info-title">当前负责班级</div>
          <div v-if="!currentTeacher.classes" class="empty-tip">
            暂未负责任何班级
          </div>
          <div v-else class="current-classes-list">
            <el-tag 
              v-for="classItem in currentTeacher.classes.split(',')" 
              :key="classItem"
              type="success"
              class="class-tag"
            >
              {{ classItem }}
            </el-tag>
          </div>
        </div>
        
        <div class="class-select-box">
          <div class="info-title">可分配班级</div>
          <div v-if="unassignedClasses.length === 0" class="empty-tip">
            暂无未分配的班级
          </div>
          <div v-else class="class-list">
            <el-checkbox-group v-model="selectedClasses">
              <el-checkbox 
                v-for="item in unassignedClasses" 
                :key="`${item.profession}-${item.className}`"
                :label="`${item.collegeId}#${item.profession}#${item.className}`"
              >
                {{ item.collegeName }} - {{ item.profession }}{{ item.className }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelAssignClass">取 消</el-button>
          <el-button type="primary" @click="submitAssignClass" :disabled="selectedClasses.length === 0">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 取消分配班级对话框 -->
    <el-dialog 
      title="取消分配班级" 
      v-model="cancelClassDialogVisible" 
      width="700px" 
      append-to-body 
      destroy-on-close
    >
      <div v-if="cancelClassLoading" class="assign-loading">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else>
        <div class="teacher-info-box">
          <div class="info-title">教师信息</div>
          <div class="info-content">
            <div class="info-item">
              <span class="info-label">工号：</span>
              <span class="info-value">{{ currentTeacher.teacherId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">姓名：</span>
              <span class="info-value">{{ currentTeacher.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">学院：</span>
              <span class="info-value">{{ currentTeacher.college }}</span>
            </div>
          </div>
        </div>
        
        <div class="current-classes-box">
          <div class="info-title">当前负责班级</div>
          <div v-if="!currentTeacher.classes" class="empty-tip">
            暂未负责任何班级
          </div>
          <div v-else>
            <div class="cancel-select-all">
              <el-checkbox v-model="selectAllClasses" @change="handleSelectAllChange">全选</el-checkbox>
            </div>
            <div class="cancel-classes-list">
              <el-checkbox-group v-model="selectedCancelClasses">
                <el-checkbox 
                  v-for="classItem in currentTeacher.classes.split(',')" 
                  :key="classItem"
                  :label="classItem"
                  border
                >
                  {{ classItem }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelClassDialogVisible = false">取 消</el-button>
          <el-button 
            type="primary" 
            @click="submitCancelClass" 
            :disabled="selectedCancelClasses.length === 0"
          >
            确 定
          </el-button>
        </div>
      </template>
    </el-dialog>
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
  teacherId: '',
  name: '',
  college: '',
  sex: ''
})

// 表格数据
const teacherList = ref([])
const loading = ref(false)
const total = ref(0)

// 学院选项
const collegeOptions = ref([])

// 添加对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增教师')
const teacherFormRef = ref(null)

// 教师表单数据
const teacherForm = reactive({
  teacherId: '',
  name: '',
  sex: '',
  phone: '',
  college: '',
  isUsed: '1'  // 默认启用
})

// 编辑对话框相关
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  teacherId: '',
  name: '',
  sex: '',
  phone: '',
  college: '',
  isUsed: '1'
})

// 分配班级对话框相关
const assignClassDialogVisible = ref(false)
const assignClassLoading = ref(false)
const unassignedClasses = ref([])
const selectedClasses = ref([])
const currentTeacher = ref({})

// 取消分配班级对话框相关
const cancelClassDialogVisible = ref(false)
const cancelClassLoading = ref(false)
const selectAllClasses = ref(false)
const selectedCancelClasses = ref([])

// 表单验证规则
const teacherRules = {
  teacherId: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { pattern: /^\d{4,15}$/, message: '工号必须为4-15位数字', trigger: 'blur' }
  ],
  name: [
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
  isUsed: [
    { required: true, message: '请选择账号状态', trigger: 'change' }
  ]
}

// 编辑表单验证规则
const editRules = {
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
}

// 获取教师列表
const getList = async () => {
  loading.value = true
  try {
    const response = await request({
      url: '/school/teacher/manage/page',
      method: 'post',
      data: queryParams
    })
    
    const { code, msg, data } = response.data
    
    if (code === 0 && data) {
      teacherList.value = data.records || []
      total.value = data.total || 0
    } else {
      ElMessage.error(msg || '获取教师列表失败')
      teacherList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败，请稍后重试')
    teacherList.value = []
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

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  Object.assign(queryParams, {
    teacherId: '',
    name: '',
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

// 添加教师
const handleAdd = () => {
  dialogTitle.value = '新增教师'
  dialogVisible.value = true
  resetForm()
}

// 编辑教师
const handleEdit = (row) => {
  editDialogVisible.value = true
  // 填充表单数据
  Object.assign(editForm, {
    teacherId: row.teacherId,
    name: row.name,
    sex: row.sex,
    phone: row.phone,
    college: row.college,
    isUsed: row.isUsed || '1'  // 默认启用
  })
}

// 分配班级
const handleAssignClass = async (row) => {
  // 保存当前教师信息
  currentTeacher.value = { ...row }
  assignClassDialogVisible.value = true
  assignClassLoading.value = true
  selectedClasses.value = []
  
  try {
    // 获取未分配辅导员的班级，按教师所属学院筛选
    const response = await request({
      url: '/school/class/unassigned',
      method: 'get',
      params: {
        collegeName: row.college // 传入教师所属学院
      }
    })
    
    const { code, msg, data } = response.data
    
    if (code === 0) {
      unassignedClasses.value = data || []
      if (unassignedClasses.value.length === 0) {
        ElMessage.warning(`${row.college}暂无可分配的班级`)
      }
    } else {
      ElMessage.error(msg || '获取未分配班级失败')
      unassignedClasses.value = []
    }
  } catch (error) {
    console.error('获取未分配班级失败:', error)
    ElMessage.error('获取未分配班级失败，请稍后重试')
    unassignedClasses.value = []
  } finally {
    assignClassLoading.value = false
  }
}

// 删除教师
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除教师 ${row.name} 吗？删除后将不可恢复，请谨慎操作。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await request({
        url: `/school/teacher/manage/${row.teacherId}`,
        method: 'delete'
      })
      
      const { code, msg } = response.data
      
      if (code === 0) {
        ElMessage.success(`已删除教师 ${row.name}`)
        getList() // 刷新列表
      } else {
        ElMessage.error(msg || '删除教师失败')
      }
    } catch (error) {
      console.error('删除教师失败:', error)
      ElMessage.error('删除教师失败，请稍后重试')
    }
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除'
    })
  })
}

// 取消分配班级
const handleCancelClass = (row) => {
  if (!row.classes) {
    ElMessage.warning('该教师暂未分配班级')
    return
  }
  
  // 保存当前教师信息
  currentTeacher.value = { ...row }
  cancelClassDialogVisible.value = true
  cancelClassLoading.value = true
  selectedCancelClasses.value = []
  selectAllClasses.value = false
  
  // 模拟加载过程
  setTimeout(() => {
    cancelClassLoading.value = false
  }, 300)
}

// 重置表单
const resetForm = () => {
  Object.assign(teacherForm, {
    teacherId: '',
    name: '',
    sex: '',
    phone: '',
    college: '',
    isUsed: '1'
  })
  
  // 如果表单引用存在，重置校验状态
  teacherFormRef.value?.resetFields()
}

// 取消表单
const cancelForm = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const submitForm = async () => {
  if (!teacherFormRef.value) return
  
  await teacherFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请正确填写所有必填项')
      return
    }
    
    try {
      const response = await request({
        url: '/school/teacher/manage/add',
        method: 'post',
        data: teacherForm
      })
      
      const { code, msg } = response.data
      
      if (code === 0) {
        ElMessage.success('新增教师成功')
        dialogVisible.value = false
        getList() // 刷新列表
      } else {
        ElMessage.error(msg || '新增教师失败')
      }
    } catch (error) {
      console.error('新增教师失败:', error)
      ElMessage.error('新增教师失败，请稍后重试')
    }
  })
}

// 提交编辑表单
const submitEditForm = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请正确填写所有必填项')
      return
    }
    
    try {
      const updateData = {
        teacherId: editForm.teacherId,
        phone: editForm.phone,
        isUsed: "1" // 默认保持启用状态
      }
      
      const response = await request({
        url: '/school/teacher/manage/update',
        method: 'put',
        data: updateData
      })
      
      const { code, msg } = response.data
      
      if (code === 0) {
        ElMessage.success('编辑教师成功')
        editDialogVisible.value = false
        getList() // 刷新列表
      } else {
        ElMessage.error(msg || '编辑教师失败')
      }
    } catch (error) {
      console.error('编辑教师失败:', error)
      ElMessage.error('编辑教师失败，请稍后重试')
    }
  })
}

// 监听工号变化
const handleTeacherIdChange = async () => {
  if (!teacherForm.teacherId) {
    teacherForm.college = ''
    return
  }
  
  try {
    const response = await request({
      url: `/school/teacher/manage/college/${teacherForm.teacherId}`,
      method: 'get'
    })
    
    const { code, msg, data } = response.data
    
    if (code === 0 && data) {
      teacherForm.college = data
    } else {
      teacherForm.college = ''
      ElMessage.warning(msg || '未找到该工号对应的学院信息')
    }
  } catch (error) {
    console.error('获取教师所属学院失败:', error)
    teacherForm.college = ''
    ElMessage.error('获取教师所属学院失败，请稍后重试')
  }
}

// 取消分配班级
const cancelAssignClass = () => {
  assignClassDialogVisible.value = false
  selectedClasses.value = []
  unassignedClasses.value = []
}

// 提交分配班级
const submitAssignClass = async () => {
  if (selectedClasses.value.length === 0) {
    ElMessage.warning('请至少选择一个班级')
    return
  }
  
  try {
    // 准备批量分配班级的请求
    const promises = selectedClasses.value.map(item => {
      const [collegeId, profession, className] = item.split('#')
      // 找到对应的班级对象，获取完整信息
      const classObj = unassignedClasses.value.find(
        c => c.collegeId === collegeId && 
             c.profession === profession && 
             c.className === className
      )
      
      if (!classObj) {
        return Promise.reject(new Error(`未找到班级信息: ${profession}${className}`))
      }
      
      // 构造请求参数
      const requestData = {
        collegeName: classObj.collegeName,
        profession: classObj.profession,
        className: classObj.className,
        teacherId: currentTeacher.value.teacherId,
        teacherName: currentTeacher.value.name
      }
      
      // 发送请求
      return request({
        url: '/school/class/assign',
        method: 'post',
        data: requestData
      })
    })
    
    // 等待所有请求完成
    const results = await Promise.allSettled(promises)
    
    // 统计成功和失败的数量
    const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.data.code === 0).length
    const failed = results.length - succeeded
    
    if (succeeded > 0) {
      if (failed > 0) {
        ElMessage.warning(`分配班级部分成功，成功 ${succeeded} 个，失败 ${failed} 个`)
      } else {
        ElMessage.success(`已为教师 ${currentTeacher.value.name} 分配 ${succeeded} 个班级`)
      }
      assignClassDialogVisible.value = false
      getList() // 刷新列表
    } else {
      ElMessage.error('分配班级失败，请稍后重试')
    }
  } catch (error) {
    console.error('分配班级失败:', error)
    ElMessage.error('分配班级失败，请稍后重试')
  }
}

// 处理全选
const handleSelectAllChange = () => {
  if (selectAllClasses.value) {
    selectedCancelClasses.value = currentTeacher.value.classes.split(',')
  } else {
    selectedCancelClasses.value = []
  }
}

// 提交取消班级
const submitCancelClass = async () => {
  if (selectedCancelClasses.value.length === 0) {
    ElMessage.warning('请至少选择一个班级')
    return
  }
  
  try {
    // 解析当前教师的班级字符串，提取班级信息
    const parseClassInfo = (classString) => {
      // 这里需要根据实际的班级字符串格式进行解析
      // 假设格式为 "软件工程21-1"，需要拆分为专业和班级
      const match = classString.match(/^(.*?)(\d+-\d+)$/)
      if (match) {
        return {
          profession: match[1],  // 专业名称，如"软件工程"
          className: match[2]    // 班级名称，如"21-1"
        }
      }
      return null
    }
    
    // 准备批量取消班级的请求
    const promises = selectedCancelClasses.value.map(classString => {
      const classInfo = parseClassInfo(classString)
      
      if (!classInfo) {
        return Promise.reject(new Error(`无法解析班级信息: ${classString}`))
      }
      
      // 构造请求参数
      const requestData = {
        collegeName: currentTeacher.value.college,
        profession: classInfo.profession,
        className: classInfo.className
      }
      
      // 发送请求
      return request({
        url: '/school/class/unassign',
        method: 'post',
        data: requestData
      })
    })
    
    // 等待所有请求完成
    const results = await Promise.allSettled(promises)
    
    // 统计成功和失败的数量
    const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.data.code === 0).length
    const failed = results.length - succeeded
    
    if (succeeded > 0) {
      if (failed > 0) {
        ElMessage.warning(`取消班级分配部分成功，成功 ${succeeded} 个，失败 ${failed} 个`)
      } else {
        ElMessage.success(`已取消教师 ${currentTeacher.value.name} 的 ${succeeded} 个班级分配`)
      }
      cancelClassDialogVisible.value = false
      getList() // 刷新列表
    } else {
      ElMessage.error('取消班级分配失败，请稍后重试')
    }
  } catch (error) {
    console.error('取消班级分配失败:', error)
    ElMessage.error('取消班级分配失败，请稍后重试')
  }
}

// 页面加载时获取数据
onMounted(() => {
  getList()
  getCollegeList()
})
</script>

<style lang="scss" scoped>
.teacher-manage-container {
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

// 分配班级样式
.assign-loading {
  padding: 20px 0;
}

.teacher-info-box {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #ebeef5;
  
  .info-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #303133;
  }
  
  .info-content {
    display: flex;
    flex-wrap: wrap;
    
    .info-item {
      width: 50%;
      margin-bottom: 8px;
      
      .info-label {
        color: #606266;
        margin-right: 8px;
      }
      
      .info-value {
        color: #303133;
        font-weight: 500;
      }
    }
  }
}

.current-classes-box {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #ebeef5;
  
  .info-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #303133;
  }
  
  .empty-tip {
    color: #909399;
    text-align: center;
    padding: 30px 0;
  }
  
  .current-classes-list {
    display: flex;
    flex-wrap: wrap;
    max-height: 300px;
    overflow-y: auto;
    padding-right: 10px;
    
    .class-tag {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }
}

.class-select-box {
  .info-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #303133;
  }
  
  .empty-tip {
    color: #909399;
    text-align: center;
    padding: 30px 0;
  }
  
  .class-list {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 10px;
    
    .el-checkbox-group {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 12px;
      
      @media screen and (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
  }
}

.cancel-select-all {
  margin-bottom: 12px;
}

.cancel-classes-list {
  display: flex;
  flex-wrap: wrap;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
  
  .el-checkbox {
    margin-right: 12px;
    margin-bottom: 10px;
  }
}

:deep(.is-disabled) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #909399;
  cursor: not-allowed;
}
</style> 