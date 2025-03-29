<template>
  <div class="dorm-manager-container">
    <!-- 搜索过滤区域 -->
    <div class="filter-container">
      <el-card shadow="never">
        <div class="filter-form">
          <el-form :inline="true" :model="queryParams" ref="queryForm">
            <el-form-item label="工号" prop="masterId">
              <el-input v-model="queryParams.masterId" placeholder="请输入工号" clearable />
            </el-form-item>
            <el-form-item label="姓名" prop="masterName">
              <el-input v-model="queryParams.masterName" placeholder="请输入姓名" clearable />
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="queryParams.phone" placeholder="请输入电话" clearable />
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
          <div class="table-title">宿舍管理员列表</div>
          <div class="table-actions">
            <el-button type="primary" @click="handleAdd">新增宿管</el-button>
          </div>
        </div>
        
        <el-table 
          :data="managerList" 
          border 
          v-loading="loading" 
          style="width: 100%"
        >
          <el-table-column prop="masterId" label="工号" min-width="120" align="center" />
          <el-table-column prop="masterName" label="姓名" min-width="100" align="center" />
          <el-table-column prop="sex" label="性别" width="80" align="center" />
          <el-table-column prop="phone" label="联系电话" min-width="120" align="center" />
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

    <!-- 添加/编辑宿管对话框 -->
    <el-dialog 
      :title="dialogTitle" 
      v-model="dialogVisible" 
      width="700px" 
      append-to-body 
      destroy-on-close
    >
      <el-form 
        ref="managerFormRef" 
        :model="managerForm" 
        :rules="managerRules" 
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="工号" prop="hmId">
              <el-input 
                v-model="managerForm.hmId" 
                placeholder="请输入工号" 
                maxlength="20"
                :disabled="dialogTitle === '编辑宿管'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="hmName">
              <el-input 
                v-model="managerForm.hmName" 
                placeholder="请输入姓名" 
                maxlength="20"
                :disabled="dialogTitle === '编辑宿管'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="hmSex">
              <el-select 
                v-model="managerForm.hmSex" 
                placeholder="请选择性别" 
                style="width: 100%"
                :disabled="dialogTitle === '编辑宿管'"
              >
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="hmPhone">
              <el-input v-model="managerForm.hmPhone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="dialogTitle === '编辑宿管'">
            <el-form-item label="状态" prop="isUsed">
              <el-select v-model="managerForm.isUsed" placeholder="请选择状态" style="width: 100%">
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

    <!-- 删除分配宿舍楼对话框及相关内容 -->
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
  masterId: '',
  masterName: '',
  phone: '',
  sex: ''
})

// 表格数据
const managerList = ref([])
const loading = ref(false)
const total = ref(0)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增宿管')
const managerFormRef = ref(null)

// 宿管表单数据
const managerForm = reactive({
  hmId: '',
  hmName: '',
  hmSex: '',
  hmPhone: '',
  isUsed: '1'
})

// 表单验证规则
const managerRules = {
  hmId: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { pattern: /^\d{4,15}$/, message: '工号必须为4-15位数字', trigger: 'blur' }
  ],
  hmName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  hmSex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  hmPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  isUsed: [
    { required: false, message: '请选择账号状态', trigger: 'change' }
  ]
}

// 获取宿管列表
const getList = async () => {
  loading.value = true
  try {
    const response = await request({
      url: '/school/house/master/page',
      method: 'post',
      data: queryParams
    })
    
    const { code, msg, data } = response.data
    
    if (code === 0 && data) {
      managerList.value = data.records || []
      total.value = data.total || 0
    } else {
      ElMessage.error(msg || '获取宿管列表失败')
      managerList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取宿管列表失败:', error)
    ElMessage.error('获取宿管列表失败，请稍后重试')
    managerList.value = []
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
    masterId: '',
    masterName: '',
    phone: '',
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

// 添加宿管
const handleAdd = () => {
  dialogTitle.value = '新增宿管'
  dialogVisible.value = true
  resetForm()
}

// 编辑宿管
const handleEdit = (row) => {
  dialogTitle.value = '编辑宿管'
  dialogVisible.value = true
  resetForm()
  
  // 填充表单数据
  Object.assign(managerForm, {
    hmId: row.masterId,
    hmName: row.masterName,
    hmSex: row.sex,
    hmPhone: row.phone,
    isUsed: row.isUsed || '1' // 默认在职
  })
}

// 删除宿管
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除宿管 ${row.masterName} 吗？删除后将不可恢复，请谨慎操作。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await request({
        url: `/school/house/master/${row.masterId}`,
        method: 'delete'
      })
      
      const { code, msg } = response.data
      
      if (code === 0) {
        ElMessage.success(`已删除宿管 ${row.masterName}`)
        getList() // 刷新列表
      } else {
        ElMessage.error(msg || '删除宿管失败')
      }
    } catch (error) {
      console.error('删除宿管失败:', error)
      ElMessage.error('删除宿管失败，请稍后重试')
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
  Object.assign(managerForm, {
    hmId: '',
    hmName: '',
    hmSex: '',
    hmPhone: '',
    isUsed: '1'
  })
  
  // 如果表单引用存在，重置校验状态
  managerFormRef.value?.resetFields()
}

// 取消表单
const cancelForm = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const submitForm = async () => {
  if (!managerFormRef.value) return
  
  await managerFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请正确填写所有必填项')
      return
    }
    
    try {
      let url = '/school/house/master/add'
      let method = 'post'
      let data = {
        hmId: managerForm.hmId,
        hmName: managerForm.hmName,
        hmSex: managerForm.hmSex,
        hmPhone: managerForm.hmPhone
      }
      
      // 如果是编辑操作
      if (dialogTitle.value === '编辑宿管') {
        url = '/school/house/master/update'
        method = 'put'
        data = {
          hmId: managerForm.hmId,
          hmPhone: managerForm.hmPhone,
          isUsed: managerForm.isUsed
        }
      }
      
      const response = await request({
        url,
        method,
        data
      })
      
      const { code, msg } = response.data
      
      if (code === 0) {
        ElMessage.success(dialogTitle.value === '新增宿管' ? '新增宿管成功' : '编辑宿管成功')
        dialogVisible.value = false
        getList() // 刷新列表
      } else {
        ElMessage.error(msg || (dialogTitle.value === '新增宿管' ? '新增宿管失败' : '编辑宿管失败'))
      }
    } catch (error) {
      console.error(dialogTitle.value === '新增宿管' ? '新增宿管失败:' : '编辑宿管失败:', error)
      ElMessage.error(dialogTitle.value === '新增宿管' ? '新增宿管失败' : '编辑宿管失败，请稍后重试')
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.dorm-manager-container {
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

  .unassigned {
    color: #909399;
    font-style: italic;
  }

  .loading-container {
    padding: 20px;
  }

  .manager-info {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #ebeef5;

    .info-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #303133;
    }

    .info-content {
      p {
        margin: 8px 0;
        line-height: 1.5;
        
        .label {
          color: #606266;
          display: inline-block;
          min-width: 120px;
        }
      }
    }
  }

  .building-select {
    .info-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #303133;
    }
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