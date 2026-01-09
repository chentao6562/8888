<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { get, post, put } from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Check, Close } from '@element-plus/icons-vue'

interface Expense {
  id: number
  category: string
  subCategory: string
  amount: number
  description: string
  expenseDate: string
  applicantName: string
  status: string
  createdAt: string
}

const loading = ref(false)
const tableData = ref<Expense[]>([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  category: '',
  status: ''
})

const dialogVisible = ref(false)
const formRef = ref()
const form = reactive({
  projectId: undefined as number | undefined,
  category: 'office',
  subCategory: '',
  amount: 0,
  description: '',
  expenseDate: ''
})

const rules = {
  category: [{ required: true, message: '请选择支出类别', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  expenseDate: [{ required: true, message: '请选择支出日期', trigger: 'change' }]
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
  { label: '待审批', value: 'pending' },
  { label: '已批准', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已支付', value: 'paid' }
]

const projects = ref<{ id: number; name: string }[]>([])

const getCategoryLabel = (category: string) => {
  return categoryOptions.find(c => c.value === category)?.label || category
}

const getStatusTag = (status: string) => {
  const map: Record<string, { type: string; label: string }> = {
    pending: { type: 'warning', label: '待审批' },
    approved: { type: 'primary', label: '已批准' },
    rejected: { type: 'danger', label: '已拒绝' },
    paid: { type: 'success', label: '已支付' }
  }
  return map[status] || { type: 'info', label: status }
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(value || 0)
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await get('/expenses', queryParams)
    tableData.value = res.data.items
    total.value = res.data.pagination.total
  } catch (error) {
    console.error('获取支出列表失败', error)
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
  Object.assign(form, {
    projectId: undefined,
    category: 'office',
    subCategory: '',
    amount: 0,
    description: '',
    expenseDate: ''
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  try {
    await post('/expenses', form)
    ElMessage.success('提交成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('提交失败', error)
  }
}

const handleApprove = async (row: Expense) => {
  await ElMessageBox.confirm('确定要批准该支出申请吗？', '提示', {
    type: 'info'
  })
  try {
    await put(`/expenses/${row.id}/approve`, { status: 'approved' })
    ElMessage.success('已批准')
    fetchData()
  } catch (error) {
    console.error('操作失败', error)
  }
}

const handleReject = async (row: Expense) => {
  await ElMessageBox.confirm('确定要拒绝该支出申请吗？', '提示', {
    type: 'warning'
  })
  try {
    await put(`/expenses/${row.id}/approve`, { status: 'rejected' })
    ElMessage.success('已拒绝')
    fetchData()
  } catch (error) {
    console.error('操作失败', error)
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
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
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
          <span>支出记录</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">申请支出</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="category" label="类别" width="100">
          <template #default="{ row }">
            {{ getCategoryLabel(row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="subCategory" label="子类别" width="100" />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            <span class="money">{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
        <el-table-column prop="expenseDate" label="支出日期" width="120">
          <template #default="{ row }">
            {{ row.expenseDate ? new Date(row.expenseDate).toLocaleDateString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="applicantName" label="申请人" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type" size="small">
              {{ getStatusTag(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 'pending'">
              <el-button link type="success" :icon="Check" @click="handleApprove(row)">批准</el-button>
              <el-button link type="danger" :icon="Close" @click="handleReject(row)">拒绝</el-button>
            </template>
            <span v-else class="text-gray">-</span>
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

    <el-dialog v-model="dialogVisible" title="申请支出" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属项目">
          <el-select v-model="form.projectId" placeholder="请选择项目" filterable clearable style="width: 100%">
            <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="支出类别" prop="category">
          <el-select v-model="form.category" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="子类别">
          <el-input v-model="form.subCategory" placeholder="请输入子类别" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="支出日期" prop="expenseDate">
          <el-date-picker v-model="form.expenseDate" type="date" placeholder="选择支出日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
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

  .money {
    font-weight: 500;
    color: #f56c6c;
  }

  .text-gray {
    color: #909399;
  }
}
</style>
