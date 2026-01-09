<script setup lang="ts">
/**
 * 首页 - 导航和快速访问
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const eventId = ref('')

function goToEventDetail() {
  if (eventId.value) {
    router.push(`/event/${eventId.value}`)
  }
}

function goToDemo() {
  router.push('/demo')
}
</script>

<template>
  <div class="home-view">
    <div class="home-container">
      <h1 class="title">Tsugu v5 渲染器</h1>
      <p class="subtitle">Schema 驱动的 BangDream 数据展示</p>

      <el-divider />

      <div class="quick-access">
        <h3>快速访问</h3>

        <el-card class="access-card">
          <template #header>活动详情</template>
          <el-input
            v-model="eventId"
            placeholder="输入活动 ID"
            @keyup.enter="goToEventDetail"
          >
            <template #append>
              <el-button @click="goToEventDetail">
                <el-icon><Right /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-card>

        <el-card class="access-card">
          <template #header>示例页面</template>
          <el-button type="primary" @click="goToDemo" style="width: 100%">
            查看组件演示
          </el-button>
        </el-card>
      </div>

      <el-divider />

      <div class="api-docs">
        <h3>API 路由</h3>
        <el-table :data="routes" stripe>
          <el-table-column prop="path" label="路径" width="200" />
          <el-table-column prop="description" label="说明" />
          <el-table-column prop="example" label="示例" width="200" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
const routes = [
  { path: '/event/:eventId', description: '活动详情', example: '/event/123' },
  { path: '/event/:eventId/preview', description: '活动预览', example: '/event/123/preview' },
  { path: '/demo', description: '组件演示', example: '/demo' },
]
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  padding: 40px 20px;
}

.home-container {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 2.5em;
  margin-bottom: 0.5em;
  color: var(--el-text-color-primary);
}

.subtitle {
  font-size: 1.2em;
  color: var(--el-text-color-secondary);
}

.quick-access {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-access h3 {
  margin-bottom: 8px;
}

.access-card {
  width: 100%;
}

.api-docs h3 {
  margin-bottom: 16px;
}

@media (min-width: 768px) {
  .quick-access {
    flex-direction: row;
  }

  .access-card {
    flex: 1;
  }
}
</style>
