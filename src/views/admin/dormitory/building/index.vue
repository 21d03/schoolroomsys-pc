<template>
  <div class="building-manage-container">
    <div class="filter-container">
      <el-card shadow="never">
        <div class="filter-form">
          <el-form :inline="true" :model="queryParams" ref="queryForm">
            <el-form-item label="楼栋名称" prop="buildingName">
              <el-input v-model="queryParams.buildingName" placeholder="请输入楼栋名称" clearable />
            </el-form-item>
            <el-form-item label="状态" prop="status" style="width: 220px;">
              <el-select v-model="queryParams.status" placeholder="选择状态" clearable style="width: 100%">
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
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="buildingId" label="楼栋编号" width="120" align="center" />
          <el-table-column prop="buildingName" label="楼栋名称" width="120" align="center" />
          <el-table-column prop="floorCount" label="楼层数" width="80" align="center" />
          <el-table-column prop="roomCount" label="房间数" width="80" align="center" />
          <el-table-column prop="managerName" label="负责宿管" width="100" align="center" />
          <el-table-column prop="usedCount" label="入住率" min-width="150" align="center">
            <template #default="scope">
              <el-progress 
                :percentage="calculateOccupancyRate(scope.row.usedCount, scope.row.roomCount)" 
                :color="getOccupancyColor(scope.row.usedCount, scope.row.roomCount)"
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
              <el-button type="primary" link @click="handleView(scope.row)">查看</el-button>
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
        <el-form-item label="楼栋名称" prop="buildingName">
          <el-input v-model="buildingForm.buildingName" placeholder="请输入楼栋名称" />
        </el-form-item>
        <el-form-item label="楼层数" prop="floorCount">
          <el-input-number v-model="buildingForm.floorCount" :min="1" :max="30" />
        </el-form-item>
        <el-form-item label="负责宿管" prop="managerId">
          <el-select v-model="buildingForm.managerId" placeholder="请选择宿管" filterable>
            <el-option 
              v-for="item in managerOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="buildingForm.status">
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

// 查询参数
const queryParams = reactive({
  buildingName: '',
  status: ''
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
  id: '',
  buildingName: '',
  floorCount: 6,
  managerId: '',
  status: '1',
  remark: ''
})

// 表单校验规则
const buildingRules = {
  buildingName: [
    { required: true, message: '请输入楼栋名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  floorCount: [
    { required: true, message: '请输入楼层数', trigger: 'change' }
  ],
  managerId: [
    { required: true, message: '请选择负责宿管', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 表单引用
const buildingFormRef = ref(null)
const queryForm = ref(null)

// 计算入住率
const calculateOccupancyRate = (used, total) => {
  if (!total || total === 0) return 0
  return Math.floor((used / total) * 100)
}

// 获取入住率颜色
const getOccupancyColor = (used, total) => {
  const rate = calculateOccupancyRate(used, total)
  if (rate < 50) return '#67c23a'
  if (rate < 80) return '#e6a23c'
  return '#f56c6c'
}

// 获取宿管列表
const fetchDormManagers = async () => {
  try {
    // 模拟获取宿管列表
    // 实际使用时取消注释下面的代码
    // const res = await getDormManagers()
    // if (res.code === 1) {
    //   managerOptions.value = res.data.map(item => ({
    //     value: item.id,
    //     label: item.name
    //   }))
    // }
  } catch (error) {
    console.error('获取宿管列表失败:', error)
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
      buildingName: queryParams.buildingName,
      status: queryParams.status
    }

    // 模拟后端接口返回数据
    // 实际使用时取消注释下面的代码
    // const res = await getBuildingList(params)
    // if (res.code === 1) {
    //   buildingList.value = res.data.list
    //   total.value = res.data.total
    // } else {
    //   ElMessage.error(res.msg || '获取宿舍楼列表失败')
    // }

    // 模拟数据，开发时删除
    setTimeout(() => {
      buildingList.value = [
        {
          id: '1',
          buildingId: 'B001',
          buildingName: '明德楼',
          floorCount: 6,
          roomCount: 60,
          usedCount: 45,
          managerName: '张红霞',
          managerId: '1001',
          status: '1',
          remark: '男生宿舍楼'
        },
        {
          id: '2',
          buildingId: 'B002',
          buildingName: '致远楼',
          floorCount: 8,
          roomCount: 80,
          usedCount: 70,
          managerName: '李明',
          managerId: '1002',
          status: '1',
          remark: '女生宿舍楼'
        },
        {
          id: '3',
          buildingId: 'B003',
          buildingName: '博学楼',
          floorCount: 6,
          roomCount: 60,
          usedCount: 30,
          managerName: '王芳',
          managerId: '1003',
          status: '0',
          remark: '研究生宿舍楼，正在维修'
        }
      ]
      total.value = 3
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('获取宿舍楼列表失败:', error)
    loading.value = false
    ElMessage.error('获取宿舍楼列表失败')
  }
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
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增宿舍楼'
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

// 查看宿舍楼
const handleView = (row) => {
  ElMessage.info(`查看宿舍楼: ${row.buildingName}，功能开发中...`)
}

// 删除宿舍楼
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除宿舍楼 ${row.buildingName} 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 实际使用时取消注释下面的代码
      // const res = await deleteBuilding(row.id)
      // if (res.code === 1) {
      //   ElMessage.success('删除成功')
      //   getList()
      // } else {
      //   ElMessage.error(res.msg || '删除失败')
      // }

      // 模拟删除成功
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除宿舍楼失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 重置表单
const resetForm = () => {
  buildingForm.id = ''
  buildingForm.buildingName = ''
  buildingForm.floorCount = 6
  buildingForm.managerId = ''
  buildingForm.status = '1'
  buildingForm.remark = ''
  buildingFormRef.value?.resetFields()
}

// 提交表单
const submitForm = async () => {
  buildingFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        const formData = {
          buildingName: buildingForm.buildingName,
          floorCount: buildingForm.floorCount,
          managerId: buildingForm.managerId,
          status: buildingForm.status,
          remark: buildingForm.remark
        }

        let res
        if (buildingForm.id) {
          // 更新宿舍楼
          // 实际使用时取消注释下面的代码
          // res = await updateBuilding(buildingForm.id, formData)
          ElMessage.success('修改成功')
        } else {
          // 新增宿舍楼
          // 实际使用时取消注释下面的代码
          // res = await addBuilding(formData)
          ElMessage.success('添加成功')
        }

        // if (res.code === 1) {
        //   ElMessage.success(buildingForm.id ? '修改成功' : '添加成功')
        //   dialogVisible.value = false
        //   getList()
        // } else {
        //   ElMessage.error(res.msg || (buildingForm.id ? '修改失败' : '添加失败'))
        // }

        // 模拟成功，关闭对话框并刷新列表
        dialogVisible.value = false
        getList()
      } catch (error) {
        console.error(buildingForm.id ? '修改宿舍楼失败:' : '添加宿舍楼失败:', error)
        ElMessage.error(buildingForm.id ? '修改失败' : '添加失败')
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