<script setup lang="ts">
/**
 * Schema 视图 - 从后端获取 Schema 并渲染
 */
import { ref, onMounted, watch } from 'vue'
import SchemaRenderer from '@/core/SchemaRenderer.vue'
import type { SchemaNode } from '@/core/types'
import { getEventDetail, getEventPreview } from '@/api/schema'
import type { EventDetailParams, EventPreviewParams } from '@/api/schema'

const props = defineProps<{
  schemaType: 'eventDetail' | 'eventPreview';
  params: EventDetailParams | EventPreviewParams;
}>()

const schema = ref<SchemaNode | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchSchema() {
  loading.value = true
  error.value = null
  schema.value = null

  try {
    switch (props.schemaType) {
      case 'eventDetail':
        schema.value = await getEventDetail(props.params as EventDetailParams)
        break
      case 'eventPreview':
        schema.value = await getEventPreview(props.params as EventPreviewParams)
        break
      default:
        throw new Error(`Unknown schema type: ${props.schemaType}`)
    }
  } catch (e: any) {
    console.error('Failed to fetch schema:', e)
    error.value = e.response?.data?.data || e.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSchema()
})

// 监听 params 变化重新获取
watch(() => props.params, () => {
  fetchSchema()
}, { deep: true })
</script>

<template>
  <div class="schema-view">
    <!-- 加载中 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="32"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-empty :description="error">
        <template #image>
          <el-icon :size="64" color="var(--el-color-danger)"><WarningFilled /></el-icon>
        </template>
        <el-button type="primary" @click="fetchSchema">重试</el-button>
      </el-empty>
    </div>

    <!-- Schema 渲染 -->
    <SchemaRenderer v-else-if="schema" :node="schema" />
  </div>
</template>

<style scoped>
.schema-view {
  width: 100%;
  min-height: 100vh;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 12px;
  color: var(--el-text-color-secondary);
}
</style>
