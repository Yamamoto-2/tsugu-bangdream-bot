<script setup lang="ts">
/**
 * Schema 视图 - 从后端获取 Schema 并渲染
 */
import { ref, onMounted, watch } from 'vue'
import SchemaRenderer from '@/core/SchemaRenderer.vue'
import type { SchemaNode } from '@/core/types'
import { getEventDetail, getEventPreview } from '@/api/schema'
import type { EventDetailParams, EventPreviewParams } from '@/api/schema'
import { Loader2, AlertCircle } from 'lucide-vue-next'

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

watch(() => props.params, () => {
  fetchSchema()
}, { deep: true })
</script>

<template>
  <div class="w-full min-h-screen">
    <!-- 加载中 -->
    <div v-if="loading" class="flex flex-col items-center justify-center h-screen gap-3 text-muted-foreground">
      <Loader2 class="size-8 animate-spin" />
      <span>加载中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex flex-col items-center justify-center h-screen gap-3">
      <AlertCircle class="size-16 text-destructive" />
      <p class="text-muted-foreground">{{ error }}</p>
      <button
        class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
        @click="fetchSchema"
      >
        重试
      </button>
    </div>

    <!-- Schema 渲染 -->
    <SchemaRenderer v-else-if="schema" :node="schema" />
  </div>
</template>
