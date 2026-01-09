<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { get, post, put, del } from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'

interface Budget {
  id: number
  name: string
  category: string
  plannedAmount: number
  usedAmount: number
  projectName: string
  startDate: string
  endDate: string
  alertRate: number
  status: string
  createdAt: string
}

const loading = ref(false)
const tableData = ref<Budget[]>([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  category: '',
  status: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: 0,
  projectId: undefined as number | undefined,
  name: '',
  category: 'office',
  plannedAmount: 0,
  startDate: '',
  endDate: '',
  alertRate: 80
})

const rules = {
  name: [{ required: true, message: '请输入预算名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择预算类别', trigger: 'change' }],
  plannedAmount: [{ required: true, message: '请输入预算金额', trigger: 'blur' }]
}

const categoryOptions = [
  { label: '广告费', value: 'ad_cost' },
  { label: '平台费', value: 'platform_fee' },
  { label: '人工成本', value: 'labor_cost' },
  { label: '设备费', value: 'equipment' },
  { label: '办公费', value: 'office' },
  { label: '差旅费', value: 'travel' },
  { label: '营销费', value: 'marketing' },
  { label: '其他', value: 'other' }
]

const statusOptions = [
  { label: '正常', value: 'normal' },
  { label: '预警', value: 'warning' },
  { label: '超支', value: 'exceeded' }
]

const projects = ref<{ id: number; name: string }[]>([])

const getCategoryLabel = (category: string) => {
  return categoryOptions.find(c => c.value === category)?.label || category
}

const getStatusTag = (status: string) => {
  const map: Record<string, { type: string; label: string }> = {
    normal: { type: 'success', label: '正常' },
    warning: { type: 'warning', label: '预警' },
    exceeded: { type: 'danger', label: '超支' }
  }
  return map[status] || { type: 'info', label: status }
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0
  }).format(value || 0)
}

const getUsageRate = (row: Budget) => {
  if (!row.plannedAmount) return 0
  return Math.round((row.usedAmount / row.plannedAmount) * 100)
}

const getProgressColor = (rate: number, alertRate: number) => {
  if (rate >= 100) return '#f56c6c'
  if (rate >= alertRate) return '#e6a23c'
  return '#67c23a'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await get('/budgets', queryParams)
    tableData.value = res.data.items
    total.value = res.data.pagination.total
  } catch (error) {
    console.error('获取预算列表失败', error)
  } finally {
    loading.value = false
  }
}

const fetchProjects = async () => {
  try {
    const res = await get('/projects', { pageSize: 100 })
    projects.value = res.data.items.map((p: any) => ({ id: p.id, name: p.name }))
  } catch (error) {
    console.error('获取项目列表失败', error)
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.category = ''
  queryParams.status = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增预算'
  isEdit.value = false
  Object.assign(form, {
    id: 0,
    projectId: undefined,
    name: '',
    category: 'office',
    plannedAmount: 0,
    startDate: '',
    endDate: '',
    alertRate: 80
  })
  dialogVisible.value = true
}

const handleEdit = (row: Budget) => {
  dialogTitle.value = '编辑预算'
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    name: row.name,
    category: row.category,
    plannedAmount: row.plannedAmount,
    startDate: row.startDate ? row.startDate.split('T')[0] : '',
    endDate: row.endDate ? row.endDate.split('T')[0] : '',
    alertRate: row.alertRate
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  try {
    if (isEdit.value) {
      await put(`/budgets/${form.id}`, form)
      ElMessage.success('更新成功')
    } else {
      await post('/budgets', form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存失败', error)
  }
}

const handleDelete = async (row: Budget) => {
  await ElMessageBox.confirm('确定要删除该预算吗？', '提示', {
    type: 'warning'
  })
  try {
    await del(`/budgets/${row.id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除失败', error)
  }
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

onMounted(() => {
  fetchData()
  fetchProjects()
})
</script>

<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="类别">
          <el-select v-model="queryParams.category" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 100px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>预算管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增预算</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="name" label="预算名称" min-width="150" />
        <el-table-column prop="category" label="类别" width="100">
          <template #default="{ row }">
            {{ getCategoryLabel(row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="所属项目" width="150" show-overflow-tooltip />
        <el-table-column prop="plannedAmount" label="预算金额" width="120" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.plannedAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="usedAmount" label="已使用" width="120" align="right">
          <template #default="{ row }">
            {{ formatMoney(row.usedAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="使用率" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="getUsageRate(row)"
              :color="getProgressColor(getUsageRate(row), row.alertRate)"
              :stroke-width="10"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type" size="small">
              {{ getStatusTag(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="200">
          <template #default="{ row }">
            {{ row.startDate ? new Date(row.startDate).toLocaleDateString() : '' }}
            ~
            {{ row.endDate ? new Date(row.endDate).toLocaleDateString() : '' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          :page-size="queryParams.pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属项目">
          <el-select v-model="form.projectId" placeholder="请选择项目" filterable clearable style="width: 100%">
            <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="预算名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入预算名称" />
        </el-form-item>
        <el-form-item label="预算类别" prop="category">
          <el-select v-model="form.category" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="预算金额" prop="plannedAmount">
          <el-input-number v-model="form.plannedAmount" :min="0" :precision="0" style="width: 100%" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期">
              <el-date-picker v-model="form.startDate" type="date" placeholder="选择开始日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期">
              <el-date-picker v-model="form.endDate" type="date" placeholder="选择结束日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="预警阈值">
          <el-slider v-model="form.alertRate" :min="50" :max="100" :format-tooltip="(val: number) => val + '%'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-container {
  .search-card {
    margin-bottom: 16px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
