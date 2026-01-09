<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { get } from '@/utils/request'
import { useUserStore } from '@/stores/user'
import {
  TrendCharts,
  UserFilled,
  ShoppingCart,
  Money,
  List,
  Refresh
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const loading = ref(false)

// 数据总览
const overview = ref({
  projects: { active: 0, completed: 0, total: 0 },
  leads: { pending: 0, following: 0, converted: 0, total: 0 },
  orders: { thisMonth: 0, totalAmount: 0 },
  finance: { income: 0, expense: 0 },
  tasks: { pending: 0, inProgress: 0, completed: 0 }
})

// 我的任务
const myTasks = ref<any[]>([])

// 我的线索
const myLeads = ref<any[]>([])

// 最近动态
const recentActivities = ref<any[]>([])

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const [overviewRes, tasksRes, leadsRes, activitiesRes] = await Promise.all([
      get('/dashboard/overview'),
      get('/dashboard/my-tasks'),
      get('/dashboard/my-leads'),
      get('/dashboard/recent-activities')
    ])
    overview.value = overviewRes.data
    myTasks.value = tasksRes.data
    myLeads.value = leadsRes.data
    recentActivities.value = activitiesRes.data
  } catch (error) {
    console.error('获取数据失败', error)
  } finally {
    loading.value = false
  }
}

// 格式化金额
const formatMoney = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0
  }).format(value)
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  return `${days}天前`
}

// 获取任务优先级标签
const getPriorityTag = (priority: string) => {
  const map: Record<string, { type: string; label: string }> = {
    urgent: { type: 'danger', label: '紧急' },
    high: { type: 'warning', label: '高' },
    normal: { type: 'info', label: '普通' },
    low: { type: 'success', label: '低' }
  }
  return map[priority] || { type: 'info', label: priority }
}

// 获取活动类型图标
const getActivityIcon = (type: string) => {
  const map: Record<string, any> = {
    lead: UserFilled,
    order: ShoppingCart,
    task: List,
    project: TrendCharts
  }
  return map[type] || TrendCharts
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 欢迎信息 -->
    <div class="welcome-section">
      <div class="welcome-text">
        <h2>欢迎回来，{{ userStore.userInfo?.name }}</h2>
        <p>祝您工作愉快，今天也要加油哦！</p>
      </div>
      <el-button :icon="Refresh" @click="fetchData" :loading="loading">
        刷新数据
      </el-button>
    </div>

    <!-- 数据卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <div class="stat-card blue">
          <div class="stat-title">进行中项目</div>
          <div class="stat-value">{{ overview.projects.active }}</div>
          <div class="stat-change">共 {{ overview.projects.total }} 个项目</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card green">
          <div class="stat-title">待跟进线索</div>
          <div class="stat-value">{{ overview.leads.pending + overview.leads.following }}</div>
          <div class="stat-change">已转化 {{ overview.leads.converted }} 个</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card orange">
          <div class="stat-title">本月订单</div>
          <div class="stat-value">{{ overview.orders.thisMonth }}</div>
          <div class="stat-change">{{ formatMoney(overview.orders.totalAmount) }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card cyan">
          <div class="stat-title">待处理任务</div>
          <div class="stat-value">{{ overview.tasks.pending + overview.tasks.inProgress }}</div>
          <div class="stat-change">已完成 {{ overview.tasks.completed }} 个</div>
        </div>
      </el-col>
    </el-row>

    <!-- 内容区 -->
    <el-row :gutter="20">
      <!-- 我的任务 -->
      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>我的任务</span>
              <el-button link type="primary">查看全部</el-button>
            </div>
          </template>
          <el-table :data="myTasks" size="small" v-loading="loading">
            <el-table-column prop="title" label="任务名称" show-overflow-tooltip />
            <el-table-column prop="projectName" label="所属项目" width="120" show-overflow-tooltip />
            <el-table-column prop="priority" label="优先级" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="getPriorityTag(row.priority).type" size="small">
                  {{ getPriorityTag(row.priority).label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="dueDate" label="截止日期" width="100">
              <template #default="{ row }">
                {{ row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 我的线索 -->
      <el-col :span="12">
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>我的线索</span>
              <el-button link type="primary">查看全部</el-button>
            </div>
          </template>
          <el-table :data="myLeads" size="small" v-loading="loading">
            <el-table-column prop="name" label="客户名称" show-overflow-tooltip />
            <el-table-column prop="phone" label="电话" width="120" />
            <el-table-column prop="sourcePlatform" label="来源" width="100" />
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'pending' ? 'warning' : 'primary'" size="small">
                  {{ row.status === 'pending' ? '待跟进' : '跟进中' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近动态 -->
    <el-card class="content-card mt-20">
      <template #header>
        <div class="card-header">
          <span>最近动态</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="activity in recentActivities.slice(0, 10)"
          :key="activity.relatedId + activity.time"
          :timestamp="formatTime(activity.time)"
          placement="top"
        >
          <div class="activity-item">
            <el-icon class="activity-icon">
              <component :is="getActivityIcon(activity.type)" />
            </el-icon>
            <div class="activity-content">
              <span class="activity-title">{{ activity.title }}</span>
              <span class="activity-desc">{{ activity.description }}</span>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.dashboard-container {
  .welcome-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;

    .welcome-text {
      h2 {
        margin: 0 0 8px 0;
        font-size: 20px;
        color: #303133;
      }

      p {
        margin: 0;
        color: #909399;
      }
    }
  }

  .stat-cards {
    margin-bottom: 20px;
  }

  .stat-card {
    padding: 20px;
    border-radius: 8px;
    color: #fff;

    .stat-title {
      font-size: 14px;
      opacity: 0.8;
      margin-bottom: 10px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 600;
    }

    .stat-change {
      font-size: 12px;
      margin-top: 8px;
      opacity: 0.8;
    }

    &.blue {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.green {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    &.orange {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.cyan {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
  }

  .content-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;

    .activity-icon {
      color: #409eff;
    }

    .activity-content {
      .activity-title {
        font-weight: 500;
        margin-right: 8px;
      }

      .activity-desc {
        color: #909399;
      }
    }
  }
}
</style>
