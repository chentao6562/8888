/**
 * 用户状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { post, get } from '@/utils/request'
import router from '@/router'

export interface UserInfo {
  id: number
  username: string
  name: string
  role: string
  avatar?: string
  email?: string
  phone?: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'admin')
  const isManager = computed(() => ['admin', 'manager'].includes(userInfo.value?.role || ''))

  // 登录
  async function login(username: string, password: string) {
    const res: any = await post('/auth/login', { username, password })
    token.value = res.data.token
    userInfo.value = res.data.user
    localStorage.setItem('token', res.data.token)
    return res
  }

  // 获取用户信息
  async function fetchUserInfo() {
    if (!token.value) return null
    try {
      const res: any = await get('/auth/me')
      userInfo.value = res.data
      return res.data
    } catch (error) {
      logout()
      return null
    }
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  // 修改密码
  async function changePassword(oldPassword: string, newPassword: string) {
    return await post('/auth/password', { oldPassword, newPassword })
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    isManager,
    login,
    fetchUserInfo,
    logout,
    changePassword
  }
})
