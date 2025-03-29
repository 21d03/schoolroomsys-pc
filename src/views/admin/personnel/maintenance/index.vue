<template>
  <div class="maintenance-container">
    <!-- 搜索过滤区域 -->
    <div class="filter-container">
      <el-card shadow="never">
        <div class="filter-form">
          <el-form :inline="true" :model="queryParams" ref="queryForm">
            <el-form-item label="工号" prop="rpId">
              <el-input v-model="queryParams.rpId" placeholder="请输入工号" clearable />
            </el-form-item>
            <el-form-item label="姓名" prop="rpName">
              <el-input v-model="queryParams.rpName" placeholder="请输入姓名" clearable />
            </el-form-item>
            <el-form-item label="联系电话" prop="rpPhone">
              <el-input v-model="queryParams.rpPhone" placeholder="请输入电话" clearable />
            </el-form-item>
            <el-form-item label="校区" prop="campus">
              <el-select v-model="queryParams.campus" placeholder="请选择校区" clearable style="width: 180px">
                <el-option 
                  v-for="item in campusOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="性别" prop="rpSex">
              <el-select v-model="queryParams.rpSex" placeholder="请选择性别" clearable style="width: 120px">
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
          <div class="table-title">维修人员列表</div>
          <div class="table-actions">
            <el-button type="primary" @click="handleAdd">新增维修人员</el-button>
          </div>
        </div>
        
        <el-table 
          :data="workerList" 
          border 
          v-loading="loading" 
          style="width: 100%"
        >
          <el-table-column prop="rpId" label="工号" min-width="120" align="center" />
          <el-table-column prop="rpName" label="姓名" min-width="100" align="center" />
          <el-table-column prop="rpSex" label="性别" width="80" align="center" />
          <el-table-column prop="rpPhone" label="联系电话" min-width="120" align="center" />
          <el-table-column label="所属校区" min-width="120" align="center">
            <template #default="scope">
              <span>{{ scope.row.campus === '1' ? '梁园校区' : scope.row.campus === '2' ? '睢阳校区' : '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="180" align="center" fixed="right">
            <template #default="scope">
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

    <!-- 添加/编辑维修人员对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="700px" 
      append-to-body 
      destroy-on-close
    >
      <el-form 
        ref="workerFormRef" 
        :model="workerForm" 
        :rules="workerRules" 
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工号" prop="rpId">
              <el-input 
                v-model="workerForm.rpId" 
                placeholder="请输入工号" 
                maxlength="20"
                :disabled="dialogTitle === '编辑维修人员'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="rpName">
              <el-input 
                v-model="workerForm.rpName" 
                placeholder="请输入姓名" 
                maxlength="20"
                :disabled="dialogTitle === '编辑维修人员'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="rpSex">
              <el-select 
                v-model="workerForm.rpSex" 
                placeholder="请选择性别" 
                style="width: 100%"
                :disabled="dialogTitle === '编辑维修人员'"
              >
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="rpPhone">
              <el-input v-model="workerForm.rpPhone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属校区" prop="campus">
              <el-select 
                v-model="workerForm.campus" 
                placeholder="请选择校区" 
                style="width: 100%"
                :disabled="dialogTitle === '编辑维修人员'"
              >
                <el-option 
                  v-for="item in campusOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="dialogTitle === '编辑维修人员'">
            <el-form-item label="状态" prop="isUsed">
              <el-select v-model="workerForm.isUsed" placeholder="请选择状态" style="width: 100%">
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
  rpId: '',
  rpName: '',
  rpPhone: '',
  campus: '',
  rpSex: ''
})

// 表格数据
const workerList = ref([])
const loading = ref(false)
const total = ref(0)

// 校区选项
const campusOptions = ref([
  { label: '梁园校区', value: '1' },
  { label: '睢阳校区', value: '2' }
])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增维修人员')
const workerFormRef = ref(null)

// 维修人员表单数据
const workerForm = reactive({
  rpId: '',
  rpName: '',
  rpSex: '',
  rpPhone: '',
  campus: '',
  isUsed: '1' // 默认在职
})

// 表单验证规则
const workerRules = {
  rpId: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { pattern: /^\d{4,15}$/, message: '工号必须为4-15位数字', trigger: 'blur' }
  ],
  rpName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  rpSex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  rpPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  campus: [
    { required: true, message: '请选择校区', trigger: 'change' }
  ],
  isUsed: [
    { required: false, message: '请选择账号状态', trigger: 'change' }
  ]
}

// 获取维修人员列表
const getList = async () => {
  loading.value = true
  try {
    const response = await request({
      url: '/school/repair/people/page',
      method: 'post',
      data: queryParams
    })
    
    const { code, msg, data } = response.data
    
    if (code === 0 && data) {
      workerList.value = data.records || []
      total.value = data.total || 0
    } else {
      ElMessage.error(msg || '获取维修人员列表失败')
      workerList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取维修人员列表失败:', error)
    ElMessage.error('获取维修人员列表失败，请稍后重试')
    workerList.value = []
    total.value = 0
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
    rpId: '',
    rpName: '',
    rpPhone: '',
    campus: '',
    rpSex: '',
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

// 添加维修人员
const handleAdd = () => {
  dialogTitle.value = '新增维修人员'
  dialogVisible.value = true
  resetForm()
}

// 编辑维修人员
const handleEdit = (row) => {
  dialogTitle.value = '编辑维修人员'
  dialogVisible.value = true
  resetForm()
  
  // 填充表单数据
  Object.assign(workerForm, {
    rpId: row.rpId,
    rpName: row.rpName,
    rpSex: row.rpSex,
    rpPhone: row.rpPhone,
    campus: row.campus,
    isUsed: row.isUsed || '1' // 默认在职
  })
}

// 删除维修人员
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除维修人员 ${row.rpName} 吗？删除后将不可恢复，请谨慎操作。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await request({
        url: `/school/repair/people/${row.rpId}`,
        method: 'delete'
      })
      
      const { code, msg } = response.data
      
      if (code === 0) {
        ElMessage.success(`已删除维修人员 ${row.rpName}`)
        getList() // 刷新列表
      } else {
        ElMessage.error(msg || '删除失败')
      }
    } catch (error) {
      console.error('删除维修人员失败:', error)
      ElMessage.error('删除维修人员失败，请稍后重试')
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
  Object.assign(workerForm, {
    rpId: '',
    rpName: '',
    rpSex: '',
    rpPhone: '',
    campus: '',
    isUsed: '1'
  })
  
  // 如果表单引用存在，重置校验状态
  workerFormRef.value?.resetFields()
}

// 取消表单
const cancelForm = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const submitForm = async () => {
  if (!workerFormRef.value) return
  
  await workerFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请正确填写所有必填项')
      return
    }
    
    try {
      // 准备提交的数据
      let submitData;
      let url;
      const method = dialogTitle.value === '新增维修人员' ? 'post' : 'put';
      
      if (dialogTitle.value === '新增维修人员') {
        // 新增维修人员
        submitData = {
          rpId: workerForm.rpId,
          rpName: workerForm.rpName,
          rpSex: workerForm.rpSex,
          rpPhone: workerForm.rpPhone,
          campus: workerForm.campus,
          isUsed: '1' // 新增时始终使用启用状态
        };
        url = '/school/repair/people/add';
      } else {
        // 编辑维修人员，只传递允许修改的字段
        submitData = {
          rpId: workerForm.rpId,
          rpPhone: workerForm.rpPhone,
          isUsed: workerForm.isUsed
        };
        url = '/school/repair/people/update';
      }
      
      const response = await request({
        url,
        method,
        data: submitData
      })
      
      const { code, msg } = response.data
      
      if (code === 0) {
        ElMessage.success(dialogTitle.value === '新增维修人员' ? '新增维修人员成功' : '编辑维修人员成功')
        dialogVisible.value = false
        getList() // 刷新列表
      } else {
        ElMessage.error(msg || (dialogTitle.value === '新增维修人员' ? '新增维修人员失败' : '编辑维修人员失败'))
      }
    } catch (error) {
      console.error(dialogTitle.value === '新增维修人员' ? '新增维修人员失败:' : '编辑维修人员失败:', error)
      ElMessage.error(dialogTitle.value === '新增维修人员' ? '新增维修人员失败，请稍后重试' : '编辑维修人员失败，请稍后重试')
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.maintenance-container {
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

// 深度选择器，修改禁用输入框样式
:deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: not-allowed;
}

:deep(.el-select.is-disabled .el-input__inner) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: not-allowed;
}
</style> 