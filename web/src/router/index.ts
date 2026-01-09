/**
 * 路由配置
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/index.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'HomeFilled' }
      },
      // 项目管理模块 - 核心模块
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/pages/projects/index.vue'),
        meta: { title: '项目列表', icon: 'Folder' }
      },
      {
        path: 'projects/accounts',
        name: 'ProjectAccounts',
        component: () => import('@/pages/projects/accounts.vue'),
        meta: { title: '账号管理', icon: 'Platform' }
      },
      {
        path: 'projects/videos',
        name: 'ProjectVideos',
        component: () => import('@/pages/projects/videos.vue'),
        meta: { title: '视频管理', icon: 'VideoCamera' }
      },
      {
        path: 'projects/traffic',
        name: 'ProjectTraffic',
        component: () => import('@/pages/projects/traffic.vue'),
        meta: { title: '流量看板', icon: 'DataLine' }
      },
      {
        path: 'projects/leads',
        name: 'ProjectLeads',
        component: () => import('@/pages/leads/index.vue'),
        meta: { title: '线索管理', icon: 'Connection' }
      },
      {
        path: 'projects/customers',
        name: 'ProjectCustomers',
        component: () => import('@/pages/customers/index.vue'),
        meta: { title: '客户管理', icon: 'UserFilled' }
      },
      {
        path: 'projects/orders',
        name: 'ProjectOrders',
        component: () => import('@/pages/orders/index.vue'),
        meta: { title: '订单管理', icon: 'ShoppingCart' }
      },
      // 任务管理
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/pages/tasks/index.vue'),
        meta: { title: '任务管理', icon: 'List' }
      },
      // 财务管理
      {
        path: 'finance',
        name: 'Finance',
        redirect: '/finance/expenses',
        meta: { title: '财务管理', icon: 'Money' },
        children: [
          {
            path: 'expenses',
            name: 'Expenses',
            component: () => import('@/pages/finance/expenses.vue'),
            meta: { title: '支出管理' }
          },
          {
            path: 'budgets',
            name: 'Budgets',
            component: () => import('@/pages/finance/budgets.vue'),
            meta: { title: '预算管理' }
          }
        ]
      },
      // 工作报告
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/pages/reports/index.vue'),
        meta: { title: '工作报告', icon: 'Document' }
      },
      // 用户管理
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/pages/users/index.vue'),
        meta: { title: '用户管理', icon: 'User', roles: ['admin', 'manager'] }
      },
      // 系统设置
      {
        path: 'settings',
        name: 'Settings',
        redirect: '/settings/announcements',
        meta: { title: '系统设置', icon: 'Setting', roles: ['admin', 'manager'] },
        children: [
          {
            path: 'announcements',
            name: 'Announcements',
            component: () => import('@/pages/settings/announcements.vue'),
            meta: { title: '公告管理' }
          },
          {
            path: 'website',
            name: 'Website',
            component: () => import('@/pages/settings/website.vue'),
            meta: { title: '官网管理' }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/error/404.vue'),
    meta: { title: '页面不存在', public: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '公司管理系统'} - 公司管理系统`

  const userStore = useUserStore()

  // 公开页面直接放行
  if (to.meta.public) {
    next()
    return
  }

  // 未登录跳转登录页
  if (!userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // 获取用户信息
  if (!userStore.userInfo) {
    await userStore.fetchUserInfo()
  }

  // 权限检查
  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles && userStore.userInfo) {
    if (!requiredRoles.includes(userStore.userInfo.role)) {
      next({ path: '/dashboard' })
      return
    }
  }

  next()
})

export default router
