<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { get, post, put, del } from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, User, Phone } from '@element-plus/icons-vue'

interface Lead {
  id: number
  customerName: string
  phone: string
  wechat: string
  sourcePlatform: string
  sourceType: string
  status: string
  assigneeName: string
  createdAt: string
}

const loading = ref(false)
const tableData = ref<Lead[]>([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  status: '',
  sourcePlatform: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: 0,
  customerName: '',
  phone: '',
  wechat: '',
  sourcePlatform: 'douyin',
  sourceType: 'private_message',
  status: 'pending',
  remark: ''
})

const rules = {
  customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
}

const platformOptions = [
  { label: '抖音', value: 'douyin' },
  { label: '快手', value: 'kuaishou' },
  { label: '小红书', value: 'xiaohongshu' },
  { label: '视频号', value: 'shipinhao' },
  { label: '微信', value: 'wechat' },
  { label: '其他', value: 'other' }
]

const sourceTypeOptions = [
  { label: '私信留资', value: 'private_message' },
  { label: '引流加微', value: 'to_wechat' },
  { label: '首销成交', value: 'first_sale' },
  { label: '复购成交', value: 'repeat_sale' }
]

const statusOptions = [
  { label: '待跟进', value: 'pending' },
  { label: '跟进中', value: 'following' },
  { label: '已转化', value: 'converted' },
  { label: '已流失', value: 'lost' },
  { label: '搁置', value: 'hold' }
]

const getStatusTag = (status: string) => {
  const map: Record<string, { type: string; label: string }> = {
    pending: { type: 'warning', label: '待跟进' },
    following: { type: 'primary', label: '跟进中' },
    converted: { type: 'success', label: '已转化' },
    lost: { type: 'danger', label: '已流失' },
    hold: { type: 'info', label: '搁置' }
  }
  return map[status] || { type: 'info', label: status }
}

const getPlatformLabel = (platform: string) => {
  return platformOptions.find(p => p.value === platform)?.label || platform
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await get('/leads', queryParams)
    tableData.value = res.data.items
    total.value = res.data.pagination.total
  } catch (error) {
    console.error('获取线索列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.status = ''
  queryParams.sourcePlatform = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增线索'
  isEdit.value = false
  Object.assign(form, {
    id: 0,
    customerName: '',
    phone: '',
    wechat: '',
    sourcePlatform: 'douyin',
    sourceType: 'private_message',
    status: 'pending',
    remark: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row: Lead) => {
  dialogTitle.value = '编辑线索'
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    customerName: row.customerName,
    phone: row.phone,
    wechat: row.wechat,
    sourcePlatform: row.sourcePlatform,
    sourceType: row.sourceType,
    status: row.status
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  try {
    if (isEdit.value) {
      await put(`/leads/${form.id}`, form)
      ElMessage.success('更新成功')
    } else {
      await post('/leads', form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存失败', error)
  }
}

const handleDelete = async (row: Lead) => {
  await ElMessageBox.confirm('确定要删除该线索吗？', '提示', {
    type: 'warning'
  })
  try {
    await del(`/leads/${row.id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除失败', error)
  }
}

const handleStatusChange = async (row: Lead, newStatus: string) => {
  try {
    await put(`/leads/${row.id}/status`, { status: newStatus })
    ElMessage.success('状态更新成功')
    fetchData()
  } catch (error) {
    console.error('状态更新失败', error)
  }
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="客户名称/电话" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源平台">
          <el-select v-model="queryParams.sourcePlatform" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
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
          <span>线索列表</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增线索</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="customerName" label="客户名称" width="120" />
        <el-table-column prop="phone" label="电话" width="130">
          <template #default="{ row }">
            <el-button link :icon="Phone">{{ row.phone }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="wechat" label="微信" width="120" />
        <el-table-column prop="sourcePlatform" label="来源平台" width="100">
          <template #default="{ row }">
            {{ getPlatformLabel(row.sourcePlatform) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-dropdown @command="(cmd: string) => handleStatusChange(row, cmd)">
              <el-tag :type="getStatusTag(row.status).type" style="cursor: pointer">
                {{ getStatusTag(row.status).label }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-tag>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="item in statusOptions" :key="item.value" :command="item.value">
                    {{ item.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <el-table-column prop="assigneeName" label="负责人" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
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
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="微信号">
          <el-input v-model="form.wechat" placeholder="请输入微信号" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="来源平台">
              <el-select v-model="form.sourcePlatform" style="width: 100%">
                <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源类型">
              <el-select v-model="form.sourceType" style="width: 100%">
                <el-option v-for="item in sourceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态">
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
}
</style>
