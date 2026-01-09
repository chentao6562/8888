<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <div class="error-title">页面不存在</div>
      <div class="error-desc">抱歉，您访问的页面不存在或已被删除</div>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .error-content {
    text-align: center;
    color: #fff;

    .error-code {
      font-size: 120px;
      font-weight: 700;
      line-height: 1;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .error-title {
      font-size: 32px;
      font-weight: 500;
      margin: 20px 0 10px;
    }

    .error-desc {
      font-size: 16px;
      opacity: 0.8;
      margin-bottom: 30px;
    }

    .error-actions {
      display: flex;
      gap: 16px;
      justify-content: center;

      .el-button {
        min-width: 120px;
      }
    }
  }
}
</style>
