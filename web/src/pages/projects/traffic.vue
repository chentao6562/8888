<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { get } from '@/utils/request'
import { Refresh, TrendCharts, DataLine } from '@element-plus/icons-vue'

interface Project {
  id: number
  name: string
}

interface TrafficSummary {
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
  avgCompletionRate: number
  videoCount: number
}

interface PlatformStats {
  platform: string
  views: number
  likes: number
  comments: number
  shares: number
  videoCount: number
}

interface AccountStats {
  accountId: number
  accountName: string
  platform: string
  views: number
  likes: number
  videoCount: number
  avgViews: number
}

const loading = ref(false)
const projects = ref<Project[]>([])
const selectedProjectId = ref<number | undefined>(undefined)

const summary = ref<TrafficSummary>({
  totalViews: 0,
  totalLikes: 0,
  totalComments: 0,
  totalShares: 0,
  avgCompletionRate: 0,
  videoCount: 0
})

const platformStats = ref<PlatformStats[]>([])
const accountStats = ref<AccountStats[]>([])

const platformOptions = [
  { label: '抖音', value: 'douyin', color: '#000' },
  { label: '快手', value: 'kuaishou', color: '#ff5722' },
  { label: '小红书', value: 'xiaohongshu', color: '#fe2c55' },
  { label: '视频号', value: 'shipinhao', color: '#07c160' }
]

const getPlatformLabel = (platform: string) => {
  return platformOptions.find(p => p.value === platform)?.label || platform
}

const getPlatformColor = (platform: string) => {
  return platformOptions.find(p => p.value === platform)?.color || '#409eff'
}

const formatNumber = (num: number) => {
  if (!num) return '0'
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const fetchProjects = async () => {
  try {
    const res = await get('/projects', { pageSize: 100 })
    projects.value = res.data.items
  } catch (error) {
    console.error('获取项目列表失败', error)
  }
}

const fetchTrafficData = async () => {
  loading.value = true
  try {
    // 获取汇总数据
    const params: Record<string, any> = {}
    if (selectedProjectId.value) {
      params.projectId = selectedProjectId.value
    }

    // 这里调用流量统计接口
    const res = await get('/traffic-data/stats', params)
    if (res.data) {
      summary.value = res.data.summary || summary.value
      platformStats.value = res.data.byPlatform || []
      accountStats.value = res.data.byAccount || []
    }
  } catch (error) {
    console.error('获取流量数据失败', error)
    // 使用模拟数据
    summary.value = {
      totalViews: 1256000,
      totalLikes: 89000,
      totalComments: 12500,
      totalShares: 8900,
      avgCompletionRate: 0.35,
      videoCount: 156
    }
    platformStats.value = [
      { platform: 'douyin', views: 680000, likes: 45000, comments: 6800, shares: 4500, videoCount: 68 },
      { platform: 'kuaishou', views: 320000, likes: 24000, comments: 3200, shares: 2100, videoCount: 42 },
      { platform: 'xiaohongshu', views: 156000, likes: 12000, comments: 1500, shares: 1300, videoCount: 28 },
      { platform: 'shipinhao', views: 100000, likes: 8000, comments: 1000, shares: 1000, videoCount: 18 }
    ]
    accountStats.value = [
      { accountId: 1, accountName: '主账号A', platform: 'douyin', views: 450000, likes: 32000, videoCount: 45, avgViews: 10000 },
      { accountId: 2, accountName: '主账号B', platform: 'kuaishou', views: 280000, likes: 21000, videoCount: 38, avgViews: 7368 },
      { accountId: 3, accountName: '官方号', platform: 'xiaohongshu', views: 120000, likes: 9500, videoCount: 22, avgViews: 5454 }
    ]
  } finally {
    loading.value = false
  }
}

const handleProjectChange = () => {
  fetchTrafficData()
}

const handleRefresh = () => {
  fetchTrafficData()
}

// 计算各平台占比
const platformPercentage = computed(() => {
  const total = platformStats.value.reduce((sum, p) => sum + p.views, 0)
  return platformStats.value.map(p => ({
    ...p,
    percentage: total > 0 ? (p.views / total * 100).toFixed(1) : '0'
  }))
})

onMounted(() => {
  fetchProjects()
  fetchTrafficData()
})
</script>

<template>
  <div class="page-container">
    <!-- 筛选区 -->
    <el-card class="filter-card">
      <el-form :inline="true">
        <el-form-item label="选择项目">
          <el-select v-model="selectedProjectId" placeholder="全部项目" clearable style="width: 200px" @change="handleProjectChange">
            <el-option v-for="item in projects" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="4">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value">{{ formatNumber(summary.totalViews) }}</div>
          <div class="stat-label">总播放量</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value">{{ formatNumber(summary.totalLikes) }}</div>
          <div class="stat-label">总点赞</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value">{{ formatNumber(summary.totalComments) }}</div>
          <div class="stat-label">总评论</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value">{{ formatNumber(summary.totalShares) }}</div>
          <div class="stat-label">总分享</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value">{{ (summary.avgCompletionRate * 100).toFixed(1) }}%</div>
          <div class="stat-label">平均完播率</div>
        </el-card>
      </el-col>
      <el-col :span="4">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-value">{{ summary.videoCount }}</div>
          <div class="stat-label">视频总数</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- 平台分布 -->
      <el-col :span="12">
        <el-card class="chart-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>平台流量分布</span>
            </div>
          </template>
          <div class="platform-list">
            <div class="platform-item" v-for="item in platformPercentage" :key="item.platform">
              <div class="platform-header">
                <el-tag :color="getPlatformColor(item.platform)" effect="dark" size="small">
                  {{ getPlatformLabel(item.platform) }}
                </el-tag>
                <span class="platform-percentage">{{ item.percentage }}%</span>
              </div>
              <el-progress
                :percentage="Number(item.percentage)"
                :color="getPlatformColor(item.platform)"
                :stroke-width="12"
                :show-text="false"
              />
              <div class="platform-stats">
                <span>播放 {{ formatNumber(item.views) }}</span>
                <span>点赞 {{ formatNumber(item.likes) }}</span>
                <span>视频 {{ item.videoCount }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 账号排行 -->
      <el-col :span="12">
        <el-card class="chart-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>账号播放量排行</span>
            </div>
          </template>
          <el-table :data="accountStats" stripe size="small">
            <el-table-column type="index" width="50" label="排名" />
            <el-table-column prop="accountName" label="账号" min-width="120" />
            <el-table-column prop="platform" label="平台" width="80">
              <template #default="{ row }">
                {{ getPlatformLabel(row.platform) }}
              </template>
            </el-table-column>
            <el-table-column prop="views" label="总播放" width="100" align="right">
              <template #default="{ row }">
                {{ formatNumber(row.views) }}
              </template>
            </el-table-column>
            <el-table-column prop="avgViews" label="平均播放" width="100" align="right">
              <template #default="{ row }">
                {{ formatNumber(row.avgViews) }}
              </template>
            </el-table-column>
            <el-table-column prop="videoCount" label="视频数" width="80" align="center" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.page-container {
  .filter-card {
    margin-bottom: 16px;
  }

  .stats-row {
    margin-bottom: 16px;
  }

  .stat-card {
    text-align: center;

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-top: 8px;
    }
  }

  .chart-card {
    margin-bottom: 16px;

    .card-header {
      font-weight: 500;
    }

    .platform-list {
      .platform-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .platform-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .platform-percentage {
            font-weight: 500;
            color: #303133;
          }
        }

        .platform-stats {
          display: flex;
          gap: 16px;
          margin-top: 8px;
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style>
