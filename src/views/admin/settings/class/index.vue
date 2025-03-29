<template>
  <div class="class-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="header-title">班级管理</span>
          <div class="operation-group">
            <el-button type="primary" @click="handleAdd">添加班级</el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="所属学院">
            <el-select 
              v-model="searchForm.collegeId" 
              placeholder="请选择所属学院"
              clearable
              @change="handleCollegeChange"
              style="width: 240px"
            >
              <el-option
                v-for="item in collegeOptions"
                :key="item.collegeId"
                :label="item.collegeName"
                :value="item.collegeId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="专业名称">
            <el-select 
              v-model="searchForm.professionId" 
              placeholder="请选择专业"
              clearable
              @click="handleProfessionClick"
              style="width: 240px"
            >
              <el-option
                v-for="item in professionOptions"
                :key="item.profession"
                :label="item.profession"
                :value="item.profession"
              />
            </el-select>
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
        :data="classList"
        border
        style="width: 100%"
      >
        <el-table-column prop="collegeName" label="学院" min-width="150" align="center" />
        <el-table-column prop="profession" label="专业" min-width="150" align="center" />
        <el-table-column prop="className" label="班级" min-width="120" align="center" />
        <el-table-column prop="studentCount" label="学生人数" width="100" align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
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
    
    <!-- 添加/编辑班级对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加班级' : '编辑班级'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="classFormRef"
        :model="classForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="所属学院" prop="collegeName">
          <el-select 
            v-model="classForm.collegeName" 
            placeholder="请选择所属学院"
            @change="handleFormCollegeChange"
            style="width: 340px"
          >
            <el-option
              v-for="item in collegeOptions"
              :key="item.collegeId"
              :label="item.collegeName"
              :value="item.collegeName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属专业" prop="profession">
          <el-select 
            v-model="classForm.profession" 
            placeholder="请选择专业"
            :disabled="!classForm.collegeName"
            style="width: 340px"
          >
            <el-option
              v-for="item in professionOptions"
              :key="item.profession"
              :label="item.profession"
              :value="item.profession"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="classForm.className" placeholder="请输入班级名称" style="width: 340px" />
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
const classFormRef = ref(null)

// 分页参数
const page = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  collegeId: '',
  professionId: ''
})

// 班级表单数据
const classForm = reactive({
  collegeName: '',
  profession: '',
  className: '',
  oldProfession: '',
  oldClassName: ''
})

// 下拉选项数据
const collegeOptions = ref([])
const professionOptions = ref([])

// 班级列表数据
const classList = ref([])

// 表单校验规则
const rules = {
  collegeName: [
    { required: true, message: '请选择所属学院', trigger: 'change' }
  ],
  profession: [
    { required: true, message: '请选择所属专业', trigger: 'change' }
  ],
  className: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 20, message: '班级名称长度为2-20个字符', trigger: 'blur' }
  ]
}

// 获取学院列表
const getCollegeOptions = async () => {
  try {
    const res = await request.get('/school/college/list')
    if (res.data.code === 1) {
      collegeOptions.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取学院列表失败')
    }
  } catch (error) {
    console.error('获取学院列表失败:', error)
    ElMessage.error('获取学院列表失败，请稍后重试')
  }
}

// 获取专业列表
const getProfessionOptions = async (collegeName) => {
  try {
    const params = {
      pageNum: 1,
      pageSize: 999999, // 获取所有数据
      collegeName: collegeName
    }
    const res = await request.post('/school/class-manage/page', params)
    const { code, msg, data } = res.data
    if (code === 0) {
      // 从返回数据中提取专业列表
      const professions = data.records.map(item => ({
        profession: item.profession
      }))
      // 去重
      professionOptions.value = Array.from(new Set(professions.map(item => item.profession))).map(profession => ({
        profession
      }))
    } else {
      ElMessage.error(msg || '获取专业列表失败')
    }
  } catch (error) {
    console.error('获取专业列表失败:', error)
    ElMessage.error('获取专业列表失败，请稍后重试')
  }
}

// 获取班级列表
const getClassList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: page.current,
      pageSize: page.size,
      collegeName: searchForm.collegeId ? collegeOptions.value.find(item => item.collegeId === searchForm.collegeId)?.collegeName : '',
      className: ''
    }
    const res = await request.post('/school/class-manage/page', params)
    const { code, msg, data } = res.data
    if (code === 0) {
      classList.value = data.records
      page.total = data.total
    } else {
      ElMessage.error(msg || '获取班级列表失败')
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
    ElMessage.error('获取班级列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 学院选择变化
const handleCollegeChange = (value) => {
  searchForm.professionId = ''
  if (value) {
    // 根据选中的学院ID获取学院名称
    const selectedCollege = collegeOptions.value.find(item => item.collegeId === value)
    if (selectedCollege) {
      getProfessionOptions(selectedCollege.collegeName)
    }
  } else {
    professionOptions.value = []
  }
}

// 表单学院选择变化
const handleFormCollegeChange = (value) => {
  classForm.profession = ''
  if (value) {
    getProfessionOptions(value)
  } else {
    professionOptions.value = []
  }
}

// 点击专业下拉框
const handleProfessionClick = () => {
  if (!searchForm.collegeId) {
    // 如果没有选择学院，获取所有专业
    getProfessionOptions()
  }
}

// 查询按钮
const handleSearch = () => {
  page.current = 1
  getClassList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.collegeId = ''
  searchForm.professionId = ''
  professionOptions.value = []
  page.current = 1
  getClassList()
}

// 添加班级
const handleAdd = () => {
  dialogType.value = 'add'
  classForm.collegeName = ''
  classForm.profession = ''
  classForm.className = ''
  classForm.oldProfession = ''
  classForm.oldClassName = ''
  dialogVisible.value = true
}

// 编辑班级
const handleEdit = (row) => {
  dialogType.value = 'edit'
  classForm.collegeName = row.collegeName
  classForm.profession = row.profession
  classForm.className = row.className
  classForm.oldProfession = row.profession
  classForm.oldClassName = row.className
  dialogVisible.value = true
}

// 删除班级
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除班级"${row.className}"吗？删除前请确保没有关联的学生和教师。`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const params = {
        profession: row.profession,
        className: row.className
      }
      const res = await request.delete('/school/class-manage/delete', { params })
      const { code, msg } = res.data
      if (code === 0) {
        ElMessage.success('删除成功')
        getClassList()
      } else {
        ElMessage.error(msg)
      }
    } catch (error) {
      console.error('删除班级失败:', error)
      ElMessage.error('删除班级失败，请稍后重试')
    }
  }).catch(() => {
    // 取消删除操作
  })
}

// 提交表单
const submitForm = async () => {
  classFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (dialogType.value === 'add') {
          const params = {
            collegeName: classForm.collegeName,
            profession: classForm.profession,
            className: classForm.className
          }
          res = await request.post('/school/class-manage/add', params)
        } else {
          const params = {
            collegeName: classForm.collegeName,
            oldProfession: classForm.oldProfession,
            newProfession: classForm.profession,
            oldClassName: classForm.oldClassName,
            newClassName: classForm.className
          }
          res = await request.put('/school/class-manage/update', params)
        }
        
        const { code, msg } = res.data
        if (code === 0) {
          ElMessage.success(dialogType.value === 'add' ? '添加成功' : '编辑成功')
          dialogVisible.value = false
          getClassList()
        } else {
          ElMessage.error(msg)
        }
      } catch (error) {
        console.error(dialogType.value === 'add' ? '添加班级失败:' : '编辑班级失败:', error)
        ElMessage.error((dialogType.value === 'add' ? '添加' : '编辑') + '班级失败，请稍后重试')
      }
    } else {
      return false
    }
  })
}

// 分页大小变化
const handleSizeChange = (val) => {
  page.size = val
  getClassList()
}

// 当前页变化
const handleCurrentChange = (val) => {
  page.current = val
  getClassList()
}

// 页面加载时获取数据
onMounted(() => {
  getCollegeOptions()
  getClassList()
})
</script>

<style lang="scss" scoped>
.class-management {
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