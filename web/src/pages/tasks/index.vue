<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { get, post, put, del } from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, Check } from '@element-plus/icons-vue'

interface Task {
  id: number
  title: string
  description: string
  projectName: string
  assigneeName: string
  priority: string
  status: string
  dueDate: string
  createdAt: string
}

const loading = ref(false)
const tableData = ref<Task[]>([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  keyword: '',
  status: '',
  priority: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: 0,
  projectId: undefined as number | undefined,
  title: '',
  description: '',
  priority: 'normal',
  status: 'pending',
  dueDate: '',
  assigneeId: undefined as number | undefined
})

const rules = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }]
}

const priorityOptions = [
  { label: '紧急', value: 'urgent' },
  { label: '高', value: 'high' },
  { label: '普通', value: 'normal' },
  { label: '低', value: 'low' }
]

const statusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '进行中', value: 'in_progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const projects = ref<{ id: number; name: string }[]>([])
const users = ref<{ id: number; name: string }[]>([])

type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'

const getPriorityTag = (priority: string): { type: TagType; label: string } => {
  const map: Record<string, { type: TagType; label: string }> = {
    urgent: { type: 'danger', label: '紧急' },
    high: { type: 'warning', label: '高' },
    normal: { type: 'info', label: '普通' },
    low: { type: 'success', label: '低' }
  }
  return map[priority] || { type: 'info', label: priority }
}

const getStatusTag = (status: string): { type: TagType; label: string } => {
  const map: Record<string, { type: TagType; label: string }> = {
    pending: { type: 'warning', label: '待处理' },
    in_progress: { type: 'primary', label: '进行中' },
    completed: { type: 'success', label: '已完成' },
    cancelled: { type: 'info', label: '已取消' }
  }
  return map[status] || { type: 'info', label: status }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await get('/tasks', queryParams)
    tableData.value = res.data.items
    total.value = res.data.pagination.total
  } catch (error) {
    console.error('获取任务列表失败', error)
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

const fetchUsers = async () => {
  try {
    const res = await get('/users', { pageSize: 100 })
    users.value = res.data.items.map((u: any) => ({ id: u.id, name: u.name }))
  } catch (error) {
    console.error('获取用户列表失败', error)
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.status = ''
  queryParams.priority = ''
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增任务'
  isEdit.value = false
  Object.assign(form, {
    id: 0,
    projectId: undefined,
    title: '',
    description: '',
    priority: 'normal',
    status: 'pending',
    dueDate: '',
    assigneeId: undefined
  })
  dialogVisible.value = true
}

const handleEdit = (row: Task) => {
  dialogTitle.value = '编辑任务'
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    dueDate: row.dueDate ? row.dueDate.split('T')[0] : ''
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  try {
    if (isEdit.value) {
      await put(`/tasks/${form.id}`, form)
      ElMessage.success('更新成功')
    } else {
      await post('/tasks', form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存失败', error)
  }
}

const handleDelete = async (row: Task) => {
  await ElMessageBox.confirm('确定要删除该任务吗？', '提示', {
    type: 'warning'
  })
  try {
    await del(`/tasks/${row.id}`)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    console.error('删除失败', error)
  }
}

const handleComplete = async (row: Task) => {
  try {
    await put(`/tasks/${row.id}/status`, { status: 'completed' })
    ElMessage.success('任务已完成')
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
  fetchUsers()
})
</script>

<template>
  <div class="page-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="任务标题" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="queryParams.priority" placeholder="全部" clearable style="width: 100px">
            <el-option v-for="item in priorityOptions" :key="item.value" :label="item.label" :value="item.value" />
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
          <span>任务列表</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增任务</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="title" label="任务标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="projectName" label="所属项目" width="150" show-overflow-tooltip />
        <el-table-column prop="assigneeName" label="执行人" width="100" />
        <el-table-column prop="priority" label="优先级" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="getPriorityTag(row.priority).type" size="small">
              {{ getPriorityTag(row.priority).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type" size="small">
              {{ getStatusTag(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="截止日期" width="120">
          <template #default="{ row }">
            {{ row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="success" :icon="Check" @click="handleComplete(row)" v-if="row.status !== 'completed'">完成</el-button>
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
        <el-form-item label="所属项目">
          <el-select v-model="form.projectId" placeholder="请选择项目" filterable clearable style="width: 100%">
            <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入任务描述" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="执行人">
              <el-select v-model="form.assigneeId" placeholder="请选择执行人" filterable clearable style="width: 100%">
                <el-option v-for="item in users" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止日期">
              <el-date-picker v-model="form.dueDate" type="date" placeholder="选择截止日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级">
              <el-select v-model="form.priority" style="width: 100%">
                <el-option v-for="item in priorityOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
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
