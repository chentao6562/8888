<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { get, post, del } from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Delete, Upload, View } from '@element-plus/icons-vue'

interface Video {
  id: number
  title: string
  platform: string
  accountName: string
  projectName: string
  publishDate: string
  views: number
  likes: number
  comments: number
  shares: number
  completionRate: number
  createdAt: string
}

interface Project {
  id: number
  name: string
}

interface Account {
  id: number
  accountName: string
  platform: string
}

const loading = ref(false)
const tableData = ref<Video[]>([])
const total = ref(0)
const projects = ref<Project[]>([])
const accounts = ref<Account[]>([])
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  projectId: undefined as number | undefined,
  accountId: undefined as number | undefined,
  platform: '',
  keyword: ''
})

const dialogVisible = ref(false)
const formRef = ref()
const form = reactive({
  projectId: undefined as number | undefined,
  accountId: undefined as number | undefined,
  title: '',
  publishDate: '',
  views: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  completionRate: 0
})

const rules = {
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
  accountId: [{ required: true, message: '请选择所属账号', trigger: 'change' }],
  title: [{ required: true, message: '请输入视频标题', trigger: 'blur' }]
}

const platformOptions = [
  { label: '抖音', value: 'douyin' },
  { label: '快手', value: 'kuaishou' },
  { label: '小红书', value: 'xiaohongshu' },
  { label: '视频号', value: 'shipinhao' }
]

const getPlatformLabel = (platform: string) => {
  return platformOptions.find(p => p.value === platform)?.label || platform
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

const fetchAccounts = async () => {
  try {
    const params: Record<string, any> = { pageSize: 100 }
    if (queryParams.projectId) {
      params.projectId = queryParams.projectId
    }
    const res = await get('/accounts', params)
    accounts.value = res.data.items
  } catch (error) {
    console.error('获取账号列表失败', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await get('/traffic-data', queryParams)
    tableData.value = res.data.items
    total.value = res.data.pagination.total
  } catch (error) {
    console.error('获取视频列表失败', error)
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
  queryParams.accountId = undefined
  queryParams.platform = ''
  queryParams.keyword = ''
  handleSearch()
}

const handleAdd = () => {
  Object.assign(form, {
    projectId: queryParams.projectId,
    accountId: undefined,
    title: '',
    publishDate: new Date().toISOString().split('T')[0],
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    completionRate: 0
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  try {
    await post('/traffic-data', form)
    ElMessage.success('添加成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存失败', error)
  }
}

const handleDelete = async (row: Video) => {
  await ElMessageBox.confirm('确定要删除该视频数据吗？', '提示', {
    type: 'warning'
  })
  try {
    await del(`/traffic-data/${row.id}`)
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

// 项目筛选变化时重新加载账号列表
watch(() => queryParams.projectId, () => {
  queryParams.accountId = undefined
  fetchAccounts()
  handleSearch()
})

watch(() => form.projectId, () => {
  form.accountId = undefined
  if (form.projectId) {
    fetchAccounts()
  }
})

onMounted(() => {
  fetchProjects()
  fetchAccounts()
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
        <el-form-item label="账号">
          <el-select v-model="queryParams.accountId" placeholder="全部账号" clearable style="width: 150px">
            <el-option v-for="item in accounts" :key="item.id" :label="item.accountName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台">
          <el-select v-model="queryParams.platform" placeholder="全部" clearable style="width: 120px">
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
          <span>视频管理</span>
          <div>
            <el-button :icon="Upload">导入数据</el-button>
            <el-button type="primary" :icon="Plus" @click="handleAdd">添加视频</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="title" label="视频标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="platform" label="平台" width="90">
          <template #default="{ row }">
            {{ getPlatformLabel(row.platform) }}
          </template>
        </el-table-column>
        <el-table-column prop="accountName" label="账号" width="120" />
        <el-table-column prop="publishDate" label="发布日期" width="110">
          <template #default="{ row }">
            {{ row.publishDate ? new Date(row.publishDate).toLocaleDateString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="views" label="播放量" width="100" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.views) }}
          </template>
        </el-table-column>
        <el-table-column prop="likes" label="点赞" width="80" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.likes) }}
          </template>
        </el-table-column>
        <el-table-column prop="comments" label="评论" width="80" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.comments) }}
          </template>
        </el-table-column>
        <el-table-column prop="shares" label="分享" width="80" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.shares) }}
          </template>
        </el-table-column>
        <el-table-column prop="completionRate" label="完播率" width="90" align="right">
          <template #default="{ row }">
            {{ row.completionRate ? (row.completionRate * 100).toFixed(1) + '%' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
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

    <el-dialog v-model="dialogVisible" title="添加视频" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属项目" prop="projectId">
              <el-select v-model="form.projectId" placeholder="请选择项目" style="width: 100%">
                <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属账号" prop="accountId">
              <el-select v-model="form.accountId" placeholder="请选择账号" style="width: 100%">
                <el-option v-for="item in accounts" :key="item.id" :label="item.accountName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="视频标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入视频标题" />
        </el-form-item>
        <el-form-item label="发布日期">
          <el-date-picker v-model="form.publishDate" type="date" placeholder="选择发布日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="播放量">
              <el-input-number v-model="form.views" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="点赞数">
              <el-input-number v-model="form.likes" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="评论数">
              <el-input-number v-model="form.comments" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分享数">
              <el-input-number v-model="form.shares" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="完播率">
          <el-slider v-model="form.completionRate" :min="0" :max="1" :step="0.01" :format-tooltip="(val: number) => (val * 100).toFixed(0) + '%'" />
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
