<template>
  <div class="college-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="header-title">学院管理</span>
          <div class="operation-group">
            <el-button type="primary" @click="handleAdd">添加学院</el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="学院名称">
            <el-input v-model="searchForm.collegeName" placeholder="请输入学院名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="collegeList"
        border
        style="width: 100%"
      >
        <el-table-column prop="collegeId" label="学院编号" width="120" align="center" />
        <el-table-column prop="collegeName" label="学院名称" min-width="150" align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <template v-if="scope.row.collegeId !== '0'">
              <el-button
                link
                type="primary"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
            <span v-else>不可操作</span>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="page.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑学院对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加学院' : '编辑学院'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="collegeFormRef"
        :model="collegeForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="学院编号" prop="collegeId">
          <el-input v-model="collegeForm.collegeId" placeholder="请输入学院编号" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="学院名称" prop="collegeName">
          <el-input v-model="collegeForm.collegeName" placeholder="请输入学院名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// 加载状态
const loading = ref(false)

// 对话框控制
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const collegeFormRef = ref(null)

// 分页参数
const page = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  collegeName: ''
})

// 学院表单数据
const collegeForm = reactive({
  collegeId: '',
  collegeName: '',
  oldCollegeName: ''
})

// 表单校验规则
const rules = {
  collegeId: [
    { required: true, message: '请输入学院编号', trigger: 'blur' }
  ],
  collegeName: [
    { required: true, message: '请输入学院名称', trigger: 'blur' },
    { min: 2, max: 20, message: '学院名称长度为2-20个字符', trigger: 'blur' }
  ]
}

// 学院列表数据
const collegeList = ref([])

// 获取学院列表
const getCollegeList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: page.current,
      pageSize: page.size,
      collegeName: searchForm.collegeName
    }
    const res = await request.post('/school/college/page', params)
    const { code, msg, data } = res.data

    if (code === 0) {
      collegeList.value = data.records
      page.total = data.total
    } else {
      ElMessage.error(msg || '获取学院列表失败')
    }
  } catch (error) {
    console.error('获取学院列表失败:', error)
    ElMessage.error('获取学院列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 查询按钮
const handleSearch = () => {
  page.current = 1
  getCollegeList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.collegeName = ''
  page.current = 1
  getCollegeList()
}

// 添加学院
const handleAdd = () => {
  dialogType.value = 'add'
  collegeForm.collegeId = ''
  collegeForm.collegeName = ''
  dialogVisible.value = true
}

// 编辑学院
const handleEdit = (row) => {
  dialogType.value = 'edit'
  collegeForm.collegeId = row.collegeId
  collegeForm.collegeName = row.collegeName
  collegeForm.oldCollegeName = row.collegeName
  dialogVisible.value = true
}

// 删除学院
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除学院"${row.collegeName}"吗？删除前请确保没有关联的学生和教师。`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const params = {
        collegeId: row.collegeId,
        collegeName: row.collegeName
      }
      const res = await request.delete('/school/college/delete', { params })
      const { code, msg } = res.data
      
      if (code === 0) {
        ElMessage.success('删除成功')
        getCollegeList()
      } else {
        ElMessage.error(msg)
      }
    } catch (error) {
      console.error('删除学院失败:', error)
      ElMessage.error('删除学院失败，请稍后重试')
    }
  }).catch(() => {
    // 取消删除操作
  })
}

// 提交表单
const submitForm = async () => {
  collegeFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (dialogType.value === 'add') {
          const params = new URLSearchParams()
          params.append('collegeId', collegeForm.collegeId)
          params.append('collegeName', collegeForm.collegeName)
          res = await request.post('/school/college/add', params)
          const { code, msg } = res.data
          
          if (code === 0) {
            ElMessage.success('添加成功')
            dialogVisible.value = false
            getCollegeList()
          } else {
            ElMessage.error(msg)
          }
        } else {
          // 编辑学院 - 使用JSON格式
          const params = {
            collegeId: collegeForm.collegeId,
            oldCollegeName: collegeForm.oldCollegeName,
            newCollegeName: collegeForm.collegeName
          }
          res = await request.put('/school/college/update', params, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
          const { code, msg } = res.data
          
          if (code === 0) {
            ElMessage.success('编辑成功')
            dialogVisible.value = false
            getCollegeList()
          } else {
            ElMessage.error(msg)
          }
        }
      } catch (error) {
        console.error(dialogType.value === 'add' ? '添加学院失败:' : '编辑学院失败:', error)
        ElMessage.error((dialogType.value === 'add' ? '添加' : '编辑') + '学院失败，请稍后重试')
      }
    } else {
      return false
    }
  })
}

// 分页大小变化
const handleSizeChange = (val) => {
  page.size = val
  getCollegeList()
}

// 当前页变化
const handleCurrentChange = (val) => {
  page.current = val
  getCollegeList()
}

// 页面加载时获取数据
onMounted(() => {
  getCollegeList()
})
</script>

<style lang="scss" scoped>
.college-management {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-title {
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .search-section {
    margin-bottom: 20px;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 