<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { get, post } from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Plus, Search, Refresh, Document } from '@element-plus/icons-vue'

interface DailyReport {
  id: number
  reportDate: string
  todayWork: string
  tomorrowPlan: string
  problems: string
  createdAt: string
}

const activeTab = ref('daily')
const loading = ref(false)
const tableData = ref<DailyReport[]>([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  pageSize: 20,
  startDate: '',
  endDate: ''
})

const dialogVisible = ref(false)
const formRef = ref()
const form = reactive({
  reportDate: new Date().toISOString().split('T')[0],
  todayWork: '',
  tomorrowPlan: '',
  problems: ''
})

const rules = {
  reportDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  todayWork: [{ required: true, message: '请输入今日工作', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await get('/reports/daily', queryParams)
    tableData.value = res.data.items
    total.value = res.data.pagination.total
  } catch (error) {
    console.error('获取日报列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.startDate = ''
  queryParams.endDate = ''
  handleSearch()
}

const handleAdd = () => {
  Object.assign(form, {
    reportDate: new Date().toISOString().split('T')[0],
    todayWork: '',
    tomorrowPlan: '',
    problems: ''
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  try {
    await post('/reports/daily', form)
    ElMessage.success('提交成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('提交失败', error)
  }
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

// 详情对话框
const detailVisible = ref(false)
const currentReport = ref<DailyReport | null>(null)

const handleView = (row: DailyReport) => {
  currentReport.value = row
  detailVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="日报" name="daily">
        <el-card class="search-card">
          <el-form :inline="true" :model="queryParams">
            <el-form-item label="日期范围">
              <el-date-picker
                v-model="queryParams.startDate"
                type="date"
                placeholder="开始日期"
                value-format="YYYY-MM-DD"
                style="width: 150px"
              />
              <span class="mx-2">~</span>
              <el-date-picker
                v-model="queryParams.endDate"
                type="date"
                placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 150px"
              />
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
              <span>日报列表</span>
              <el-button type="primary" :icon="Plus" @click="handleAdd">写日报</el-button>
            </div>
          </template>

          <el-table :data="tableData" v-loading="loading" stripe>
            <el-table-column prop="reportDate" label="日期" width="120">
              <template #default="{ row }">
                {{ new Date(row.reportDate).toLocaleDateString() }}
              </template>
            </el-table-column>
            <el-table-column prop="todayWork" label="今日工作" min-width="300" show-overflow-tooltip />
            <el-table-column prop="tomorrowPlan" label="明日计划" min-width="200" show-overflow-tooltip />
            <el-table-column prop="problems" label="问题/困难" min-width="150" show-overflow-tooltip />
            <el-table-column prop="createdAt" label="提交时间" width="180">
              <template #default="{ row }">
                {{ new Date(row.createdAt).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" :icon="Document" @click="handleView(row)">查看</el-button>
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
      </el-tab-pane>
      <el-tab-pane label="周报" name="weekly">
        <el-empty description="周报功能开发中..." />
      </el-tab-pane>
      <el-tab-pane label="月报" name="monthly">
        <el-empty description="月报功能开发中..." />
      </el-tab-pane>
    </el-tabs>

    <!-- 写日报对话框 -->
    <el-dialog v-model="dialogVisible" title="写日报" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="日期" prop="reportDate">
          <el-date-picker
            v-model="form.reportDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="今日工作" prop="todayWork">
          <el-input
            v-model="form.todayWork"
            type="textarea"
            :rows="4"
            placeholder="请输入今日完成的工作内容"
          />
        </el-form-item>
        <el-form-item label="明日计划">
          <el-input
            v-model="form.tomorrowPlan"
            type="textarea"
            :rows="3"
            placeholder="请输入明日的工作计划"
          />
        </el-form-item>
        <el-form-item label="问题困难">
          <el-input
            v-model="form.problems"
            type="textarea"
            :rows="2"
            placeholder="请输入遇到的问题或困难"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="detailVisible" title="日报详情" width="600px">
      <el-descriptions :column="1" border v-if="currentReport">
        <el-descriptions-item label="日期">
          {{ new Date(currentReport.reportDate).toLocaleDateString() }}
        </el-descriptions-item>
        <el-descriptions-item label="今日工作">
          <div style="white-space: pre-wrap;">{{ currentReport.todayWork }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="明日计划">
          <div style="white-space: pre-wrap;">{{ currentReport.tomorrowPlan || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="问题困难">
          <div style="white-space: pre-wrap;">{{ currentReport.problems || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">
          {{ new Date(currentReport.createdAt).toLocaleString() }}
        </el-descriptions-item>
      </el-descriptions>
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

  .mx-2 {
    margin: 0 8px;
  }
}
</style>
