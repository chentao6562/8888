<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { get, post, del } from '@/utils/request'
import { ElMessage, ElMessageBox, type UploadFile, type UploadProps } from 'element-plus'
import { Plus, Search, Refresh, Delete, Upload, View, Download } from '@element-plus/icons-vue'

interface Video {
  id: number
  contentTitle: string
  contentType: string
  platform: string
  accountName: string
  projectName: string
  publishDate: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
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

interface ImportResult {
  batchNo: string
  totalRows: number
  successRows: number
  failedRows: number
  errors: string[]
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

// 导入对话框
const importDialogVisible = ref(false)
const importLoading = ref(false)
const importProjectId = ref<number | undefined>(undefined)
const importResult = ref<ImportResult | null>(null)
const fileList = ref<UploadFile[]>([])

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
    const res = await get('/traffic', queryParams)
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
    await post('/traffic', form)
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
    await del(`/traffic/${row.id}`)
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

// 打开导入对话框
const handleOpenImport = () => {
  importDialogVisible.value = true
  importProjectId.value = queryParams.projectId
  importResult.value = null
  fileList.value = []
}

// 上传前校验
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isCSV = file.name.toLowerCase().endsWith('.csv')
  if (!isCSV) {
    ElMessage.error('只支持CSV文件格式')
    return false
  }
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过50MB')
    return false
  }
  return true
}

// 执行导入
const handleImport = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择CSV文件')
    return
  }

  const uploadFile = fileList.value[0]
  if (!uploadFile || !uploadFile.raw) {
    ElMessage.warning('请先选择CSV文件')
    return
  }

  const file = uploadFile.raw

  importLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    if (importProjectId.value) {
      formData.append('projectId', String(importProjectId.value))
    }

    const res = await post('/traffic/import-csv', formData)
    importResult.value = res.data
    ElMessage.success(`导入完成：成功 ${res.data.successRows} 条，失败 ${res.data.failedRows} 条`)
    fetchData()
    fetchAccounts() // 刷新账号列表（可能有新创建的账号）
  } catch (error: any) {
    ElMessage.error(error.message || '导入失败')
  } finally {
    importLoading.value = false
  }
}

// 关闭导入对话框
const handleCloseImport = () => {
  importDialogVisible.value = false
  importResult.value = null
  fileList.value = []
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
            <el-button type="success" :icon="Upload" @click="handleOpenImport">导入CSV</el-button>
            <el-button type="primary" :icon="Plus" @click="handleAdd">添加视频</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="contentTitle" label="视频标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="contentType" label="类型" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="row.contentType === '视频' ? 'primary' : 'success'">
              {{ row.contentType || '视频' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="platform" label="平台" width="90">
          <template #default="{ row }">
            {{ getPlatformLabel(row.platform) }}
          </template>
        </el-table-column>
        <el-table-column prop="accountName" label="账号" width="140" show-overflow-tooltip />
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
        <el-table-column prop="saves" label="收藏" width="80" align="right">
          <template #default="{ row }">
            {{ formatNumber(row.saves) }}
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

    <!-- 添加视频对话框 -->
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

    <!-- 导入CSV对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入CSV数据" width="600px" @close="handleCloseImport">
      <div class="import-dialog">
        <el-alert
          title="导入说明"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        >
          <template #default>
            <div>
              <p>支持导入的CSV格式：账号、备注、平台、标题、类型、推荐、阅读（播放）、评论、分享、收藏、点赞、发布时间、链接</p>
              <p>系统会自动识别平台和账号，如果账号不存在会自动创建</p>
            </div>
          </template>
        </el-alert>

        <el-form label-width="100px">
          <el-form-item label="关联项目">
            <el-select v-model="importProjectId" placeholder="可选：关联到项目" clearable style="width: 100%">
              <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
            <div class="form-tip">新创建的账号将自动关联到此项目</div>
          </el-form-item>

          <el-form-item label="选择文件">
            <el-upload
              v-model:file-list="fileList"
              :before-upload="beforeUpload"
              :auto-upload="false"
              :limit="1"
              accept=".csv"
              drag
            >
              <el-icon class="el-icon--upload"><Upload /></el-icon>
              <div class="el-upload__text">
                将CSV文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持GBK和UTF-8编码的CSV文件，文件大小不超过50MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>

        <!-- 导入结果 -->
        <div v-if="importResult" class="import-result">
          <el-divider>导入结果</el-divider>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="批次号">{{ importResult.batchNo }}</el-descriptions-item>
            <el-descriptions-item label="总行数">{{ importResult.totalRows }}</el-descriptions-item>
            <el-descriptions-item label="成功">
              <el-text type="success">{{ importResult.successRows }}</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="失败">
              <el-text type="danger">{{ importResult.failedRows }}</el-text>
            </el-descriptions-item>
          </el-descriptions>
          <div v-if="importResult.errors.length > 0" class="error-list">
            <el-text type="danger">错误详情（前10条）：</el-text>
            <ul>
              <li v-for="(err, idx) in importResult.errors" :key="idx">{{ err }}</li>
            </ul>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="handleCloseImport">{{ importResult ? '关闭' : '取消' }}</el-button>
        <el-button v-if="!importResult" type="primary" :loading="importLoading" @click="handleImport">
          开始导入
        </el-button>
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

.import-dialog {
  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .import-result {
    margin-top: 20px;

    .error-list {
      margin-top: 10px;
      padding: 10px;
      background: #fef0f0;
      border-radius: 4px;

      ul {
        margin: 5px 0 0 20px;
        padding: 0;
        font-size: 12px;
        color: #f56c6c;
      }
    }
  }
}
</style>
