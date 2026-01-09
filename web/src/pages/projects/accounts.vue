<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { get, post, put, del } from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue'

interface Account {
  id: number
  platform: string
  accountName: string
  accountId: string
  projectId: number
  projectName: string
  followerCount: number
  status: string
  createdAt: string
}

interface Project {
  id: number
  name: string
}

const loading = ref(false)
const tableData = ref<Account[]>([])
const total = ref(0)
const projects = ref<Project[]>([])
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  projectId: undefined as number | undefined,
  platform: '',
  keyword: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: 0,
  projectId: undefined as number | undefined,
  platform: 'douyin',
  accountName: '',
  accountId: '',
  followerCount: 0,
  status: 'active'
})

const rules = {
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  accountName: [{ required: true, message: '请输入账号名称', trigger: 'blur' }]
}

const platformOptions = [
  { label: '抖音', value: 'douyin' },
  { label: '快手', value: 'kuaishou' },
  { label: '小红书', value: 'xiaohongshu' },
  { label: '视频号', value: 'shipinhao' }
]

const statusOptions = [
  { label: '活跃', value: 'active' },
  { label: '停用', value: 'inactive' }
]

const getPlatformLabel = (platform: string) => {
  return platformOptions.find(p => p.value === platform)?.label || platform
}

const getPlatformColor = (platform: string) => {
  const map: Record<string, string> = {
    douyin: '#000',
    kuaishou: '#ff5722',
    xiaohongshu: '#fe2c55',
    shipinhao: '#07c160'
  }
  return map[platform] || '#409eff'
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num?.toString() || '0'
}

const fetchProjects = async () => {
  try {
    const res = await get('/projects', { pageSize: 100 })
    projects.value = res.data.items
  } catch (error) {
    console.error('获取项目列表失败', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await get('/accounts', queryParams)
    tableData.value = res.data.items
    total.value = res.data.pagination.total
  } catch (error) {
    console.error('获取账号列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.projectId = undefined
  queryParams.platform = ''
  queryParams.keyword = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增账号'
  isEdit.value = false
  Object.assign(form, {
    id: 0,
    projectId: queryParams.projectId,
    platform: 'douyin',
    accountName: '',
    accountId: '',
    followerCount: 0,
    status: 'active'
  })
  dialogVisible.value = true
}

const handleEdit = (row: Account) => {
  dialogTitle.value = '编辑账号'
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    projectId: row.projectId,
    platform: row.platform,
    accountName: row.accountName,
    accountId: row.accountId,
    followerCount: row.followerCount,
    status: row.status
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  try {
    if (isEdit.value) {
      await put(`/accounts/${form.id}`, form)
      ElMessage.success('更新成功')
    } else {
      await post('/accounts', form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存失败', error)
  }
}

const handleDelete = async (row: Account) => {
  await ElMessageBox.confirm('确定要删除该账号吗？', '提示', {
    type: 'warning'
  })
  try {
    await del(`/accounts/${row.id}`)
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

// 项目筛选变化时重新加载
watch(() => queryParams.projectId, () => {
  handleSearch()
})

onMounted(() => {
  fetchProjects()
  fetchData()
})
</script>

<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="所属项目">
          <el-select v-model="queryParams.projectId" placeholder="全部项目" clearable style="width: 180px">
            <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台">
          <el-select v-model="queryParams.platform" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="账号名称" clearable />
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
          <span>账号管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增账号</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="platform" label="平台" width="100">
          <template #default="{ row }">
            <el-tag :color="getPlatformColor(row.platform)" effect="dark" size="small">
              {{ getPlatformLabel(row.platform) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accountName" label="账号名称" min-width="150" />
        <el-table-column prop="accountId" label="账号ID" width="150" />
        <el-table-column prop="projectName" label="所属项目" width="150" show-overflow-tooltip />
        <el-table-column prop="followerCount" label="粉丝数" width="100" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.followerCount) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="form.projectId" placeholder="请选择项目" style="width: 100%">
            <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台" prop="platform">
          <el-select v-model="form.platform" style="width: 100%">
            <el-option v-for="item in platformOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号名称" prop="accountName">
          <el-input v-model="form.accountName" placeholder="请输入账号名称" />
        </el-form-item>
        <el-form-item label="账号ID">
          <el-input v-model="form.accountId" placeholder="请输入账号ID" />
        </el-form-item>
        <el-form-item label="粉丝数">
          <el-input-number v-model="form.followerCount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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
