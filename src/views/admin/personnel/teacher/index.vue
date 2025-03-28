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
            <el-form-item label="姓名" prop="teacherName">
              <el-input v-model="queryParams.teacherName" placeholder="请输入姓名" clearable />
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
          <el-table-column prop="teacherName" label="姓名" min-width="100" align="center" />
          <el-table-column prop="sex" label="性别" width="80" align="center" />
          <el-table-column prop="phone" label="联系电话" min-width="120" align="center" />
          <el-table-column prop="college" label="所属学院" min-width="150" align="center" />
          <el-table-column prop="classes" label="分管班级" min-width="180" align="center">
            <template #default="scope">
              <span>{{ scope.row.classes || '未分配' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="240" align="center" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="success" link @click="handleAssignClass(scope.row)">分配班级</el-button>
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

    <!-- 添加/编辑教师对话框 -->
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
              <el-input v-model="teacherForm.teacherId" placeholder="请输入工号" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="teacherName">
              <el-input v-model="teacherForm.teacherName" placeholder="请输入姓名" maxlength="20" />
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
              <el-select v-model="teacherForm.college" placeholder="请选择学院" style="width: 100%">
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
            <el-form-item label="账号状态" prop="status">
              <el-select v-model="teacherForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="正常" value="1" />
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
  teacherId: '',
  teacherName: '',
  college: '',
  sex: ''
})

// 表格数据
const teacherList = ref([])
const loading = ref(false)
const total = ref(0)

// 学院选项
const collegeOptions = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增教师')
const teacherFormRef = ref(null)

// 教师表单数据
const teacherForm = reactive({
  teacherId: '',
  teacherName: '',
  sex: '',
  phone: '',
  college: '',
  status: '1'
})

// 表单验证规则
const teacherRules = {
  teacherId: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { pattern: /^\d{4,15}$/, message: '工号必须为4-15位数字', trigger: 'blur' }
  ],
  teacherName: [
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
  status: [
    { required: true, message: '请选择账号状态', trigger: 'change' }
  ]
}

// 获取教师列表
const getList = async () => {
  loading.value = true
  try {
    // 使用模拟数据，后续替换为实际API调用
    setTimeout(() => {
      teacherList.value = [
        {
          teacherId: '0500001',
          teacherName: '张老师',
          sex: '男',
          phone: '13800138000',
          college: '信息技术学院',
          classes: '软件工程2101,软件工程2102',
          status: '1'
        },
        {
          teacherId: '0500002',
          teacherName: '李老师',
          sex: '女',
          phone: '13800138001',
          college: '信息技术学院',
          classes: '计算机科学2101',
          status: '1'
        },
        {
          teacherId: '0600001',
          teacherName: '王老师',
          sex: '男',
          phone: '13800138002',
          college: '机械工程学院',
          classes: null,
          status: '1'
        }
      ]
      total.value = 3
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败')
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
      // 使用模拟数据，后续可以删除
      collegeOptions.value = [
        { label: '信息技术学院', value: '信息技术学院' },
        { label: '机械工程学院', value: '机械工程学院' },
        { label: '电气工程学院', value: '电气工程学院' },
        { label: '经济管理学院', value: '经济管理学院' },
        { label: '艺术设计学院', value: '艺术设计学院' }
      ]
    }
  } catch (error) {
    console.error('获取学院列表失败:', error)
    // 使用模拟数据，后续可以删除
    collegeOptions.value = [
      { label: '信息技术学院', value: '信息技术学院' },
      { label: '机械工程学院', value: '机械工程学院' },
      { label: '电气工程学院', value: '电气工程学院' },
      { label: '经济管理学院', value: '经济管理学院' },
      { label: '艺术设计学院', value: '艺术设计学院' }
    ]
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
    teacherName: '',
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
  dialogTitle.value = '编辑教师'
  dialogVisible.value = true
  resetForm()
  // 填充表单数据
  Object.assign(teacherForm, row)
}

// 分配班级
const handleAssignClass = (row) => {
  ElMessage.info(`准备为教师 ${row.teacherName} 分配班级，功能待实现`)
  // 这里后续可以实现班级分配功能，如打开班级分配对话框等
}

// 删除教师
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除教师 ${row.teacherName} 吗？删除后将不可恢复，请谨慎操作。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`已删除教师 ${row.teacherName}`)
    getList() // 刷新列表
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除'
    })
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(teacherForm, {
    teacherId: '',
    teacherName: '',
    sex: '',
    phone: '',
    college: '',
    status: '1'
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
      // 模拟提交成功
      setTimeout(() => {
        ElMessage.success(dialogTitle.value === '新增教师' ? '新增教师成功' : '编辑教师成功')
        dialogVisible.value = false
        getList() // 刷新列表
      }, 500)
    } catch (error) {
      console.error(dialogTitle.value === '新增教师' ? '新增教师失败:' : '编辑教师失败:', error)
      ElMessage.error(dialogTitle.value === '新增教师' ? '新增教师失败' : '编辑教师失败')
    }
  })
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
</style> 