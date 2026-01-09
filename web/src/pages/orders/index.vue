<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { get, post, put, del } from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, Money } from '@element-plus/icons-vue'

interface Order {
  id: number
  orderNo: string
  productName: string
  amount: number
  paidAmount: number
  paymentStatus: string
  status: string
  customerName: string
  salesName: string
  signedAt: string
  createdAt: string
}

const loading = ref(false)
const tableData = ref<Order[]>([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  status: '',
  paymentStatus: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: 0,
  customerId: undefined as number | undefined,
  productName: '',
  amount: 0,
  commissionRate: 0,
  status: 'pending',
  remark: ''
})

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入订单金额', trigger: 'blur' }]
}

const statusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '进行中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const paymentStatusOptions = [
  { label: '未付款', value: 'unpaid' },
  { label: '部分付款', value: 'partial' },
  { label: '已付款', value: 'paid' }
]

const customers = ref<{ id: number; name: string }[]>([])

type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'

const getStatusTag = (status: string): { type: TagType; label: string } => {
  const map: Record<string, { type: TagType; label: string }> = {
    pending: { type: 'warning', label: '待处理' },
    processing: { type: 'primary', label: '进行中' },
    completed: { type: 'success', label: '已完成' },
    cancelled: { type: 'info', label: '已取消' }
  }
  return map[status] || { type: 'info', label: status }
}

const getPaymentStatusTag = (status: string): { type: TagType; label: string } => {
  const map: Record<string, { type: TagType; label: string }> = {
    unpaid: { type: 'danger', label: '未付款' },
    partial: { type: 'warning', label: '部分付款' },
    paid: { type: 'success', label: '已付款' }
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
    const res = await get('/orders', queryParams)
    tableData.value = res.data.items
    total.value = res.data.pagination.total
  } catch (error) {
    console.error('获取订单列表失败', error)
  } finally {
    loading.value = false
  }
}

const fetchCustomers = async () => {
  try {
    const res = await get('/customers', { pageSize: 100 })
    customers.value = res.data.items.map((c: any) => ({ id: c.id, name: c.name }))
  } catch (error) {
    console.error('获取客户列表失败', error)
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.status = ''
  queryParams.paymentStatus = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增订单'
  isEdit.value = false
  Object.assign(form, {
    id: 0,
    customerId: undefined,
    productName: '',
    amount: 0,
    commissionRate: 0,
    status: 'pending',
    remark: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row: Order) => {
  dialogTitle.value = '编辑订单'
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    productName: row.productName,
    amount: row.amount,
    status: row.status
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  try {
    if (isEdit.value) {
      await put(`/orders/${form.id}`, form)
      ElMessage.success('更新成功')
    } else {
      await post('/orders', form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存失败', error)
  }
}

const handleDelete = async (row: Order) => {
  await ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
    type: 'warning'
  })
  try {
    await del(`/orders/${row.id}`)
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
  fetchCustomers()
})
</script>

<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="订单号/产品名" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="付款状态">
          <el-select v-model="queryParams.paymentStatus" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in paymentStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
          <span>订单列表</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增订单</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单号" width="160" />
        <el-table-column prop="productName" label="产品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="customerName" label="客户" width="120" />
        <el-table-column prop="amount" label="订单金额" width="120" align="right">
          <template #default="{ row }">
            <span class="money">{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paidAmount" label="已付金额" width="120" align="right">
          <template #default="{ row }">
            <span class="money paid">{{ formatMoney(row.paidAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentStatus" label="付款状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getPaymentStatusTag(row.paymentStatus).type" size="small">
              {{ getPaymentStatusTag(row.paymentStatus).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type" size="small">
              {{ getStatusTag(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="salesName" label="销售" width="100" />
        <el-table-column prop="signedAt" label="签约日期" width="120">
          <template #default="{ row }">
            {{ row.signedAt ? new Date(row.signedAt).toLocaleDateString() : '-' }}
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="客户" prop="customerId" v-if="!isEdit">
          <el-select v-model="form.customerId" placeholder="请选择客户" filterable style="width: 100%">
            <el-option v-for="item in customers" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单金额" prop="amount">
              <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提成比例">
              <el-input-number v-model="form.commissionRate" :min="0" :max="100" :precision="1" style="width: 100%">
                <template #suffix>%</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="订单状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
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

  .money {
    font-weight: 500;
    color: #f56c6c;

    &.paid {
      color: #67c23a;
    }
  }
}
</style>
