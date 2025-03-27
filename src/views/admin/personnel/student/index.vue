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

    <!-- 添加/编辑学生对话框 (后续实现) -->
    
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
  ElMessage.info('新增学生功能待实现')
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

// 页面加载时获取数据
onMounted(() => {
  getList()
  getCollegeList()
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