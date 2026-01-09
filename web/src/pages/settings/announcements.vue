<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { get, post, put, del } from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, Top } from '@element-plus/icons-vue'

interface Announcement {
  id: number
  title: string
  content: string
  isTop: boolean
  publishedAt: string
  expiredAt: string
  createdAt: string
}

const loading = ref(false)
const tableData = ref<Announcement[]>([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  pageSize: 20
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: 0,
  title: '',
  content: '',
  isTop: false,
  publishedAt: '',
  expiredAt: ''
})

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await get('/announcements', queryParams)
    tableData.value = res.data.items
    total.value = res.data.pagination.total
  } catch (error) {
    console.error('获取公告列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '发布公告'
  isEdit.value = false
  Object.assign(form, {
    id: 0,
    title: '',
    content: '',
    isTop: false,
    publishedAt: new Date().toISOString().split('T')[0],
    expiredAt: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row: Announcement) => {
  dialogTitle.value = '编辑公告'
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    title: row.title,
    content: row.content,
    isTop: row.isTop,
    publishedAt: row.publishedAt ? row.publishedAt.split('T')[0] : '',
    expiredAt: row.expiredAt ? row.expiredAt.split('T')[0] : ''
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  try {
    if (isEdit.value) {
      await put(`/announcements/${form.id}`, form)
      ElMessage.success('更新成功')
    } else {
      await post('/announcements', form)
      ElMessage.success('发布成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('保存失败', error)
  }
}

const handleDelete = async (row: Announcement) => {
  await ElMessageBox.confirm('确定要删除该公告吗？', '提示', {
    type: 'warning'
  })
  try {
    await del(`/announcements/${row.id}`)
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

// 详情对话框
const detailVisible = ref(false)
const currentAnnouncement = ref<Announcement | null>(null)

const handleView = (row: Announcement) => {
  currentAnnouncement.value = row
  detailVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-container">
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>公告管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">发布公告</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <el-icon v-if="row.isTop" color="#e6a23c" style="margin-right: 4px"><Top /></el-icon>
            <el-link type="primary" @click="handleView(row)">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="publishedAt" label="发布时间" width="180">
          <template #default="{ row }">
            {{ row.publishedAt ? new Date(row.publishedAt).toLocaleString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="expiredAt" label="过期时间" width="180">
          <template #default="{ row }">
            {{ row.expiredAt ? new Date(row.expiredAt).toLocaleString() : '永久有效' }}
          </template>
        </el-table-column>
        <el-table-column prop="isTop" label="置顶" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isTop" type="warning" size="small">置顶</el-tag>
            <span v-else>-</span>
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

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入公告内容" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布时间">
              <el-date-picker
                v-model="form.publishedAt"
                type="datetime"
                placeholder="选择发布时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期时间">
              <el-date-picker
                v-model="form.expiredAt"
                type="datetime"
                placeholder="选择过期时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="置顶">
          <el-switch v-model="form.isTop" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="detailVisible" title="公告详情" width="600px">
      <div v-if="currentAnnouncement" class="announcement-detail">
        <h3>{{ currentAnnouncement.title }}</h3>
        <div class="meta">
          <span>发布时间：{{ currentAnnouncement.publishedAt ? new Date(currentAnnouncement.publishedAt).toLocaleString() : '-' }}</span>
        </div>
        <el-divider />
        <div class="content" style="white-space: pre-wrap;">{{ currentAnnouncement.content }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-container {
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

  .announcement-detail {
    h3 {
      margin: 0 0 12px 0;
      font-size: 18px;
    }

    .meta {
      color: #909399;
      font-size: 14px;
    }

    .content {
      line-height: 1.8;
      color: #606266;
    }
  }
}
</style>
