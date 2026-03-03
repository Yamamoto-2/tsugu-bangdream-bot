<script setup lang="ts">
/**
 * 搜索列表视图
 * 流程: 搜索关键词 → /v1/fuzzySearch 拿到字典 → Schema API 传 fuzzySearchResult 渲染列表
 */
import { ref, computed, onMounted, watch } from 'vue'
import SchemaRenderer from '@/core/SchemaRenderer.vue'
import type { SchemaNode } from '@/core/types'
import ContentToolbar from '@/layouts/ContentToolbar.vue'
import { fuzzySearch, getEventList } from '@/api/schema'
import type { FuzzySearchResult } from '@/api/schema'
import { navigationGroups } from '@/config/navigation'
import { Loader2, Construction } from 'lucide-vue-next'

const props = defineProps<{
  category: string
}>()

// 查找当前分类信息
const categoryInfo = computed(() => {
  for (const group of navigationGroups) {
    const found = group.items.find(item =>
      item.routeName.toLowerCase().includes(props.category)
    )
    if (found) return found
  }
  return null
})

// 列表 Schema API 映射: fuzzySearchResult → SchemaNode
const listApiFns: Record<string, (fsr?: FuzzySearchResult) => Promise<SchemaNode>> = {
  event: (fsr) => getEventList(fsr ? { fuzzySearchResult: fsr } : {}),
}

const hasApi = computed(() => props.category in listApiFns)

const searchQuery = ref('')
const displayMode = ref<'grid' | 'list' | 'large'>('list')
const schema = ref<SchemaNode | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// 从 schema 中提取结果项列表 (Page > Container > [items])
const resultItems = computed<SchemaNode[]>(() => {
  if (!schema.value) return []
  const container = schema.value.children?.[0]
  if (!container?.children) return []
  return container.children
})

const gridClasses = computed(() => {
  switch (displayMode.value) {
    case 'grid': return 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'
    case 'large': return 'grid gap-6 md:grid-cols-2'
    case 'list': default: return 'flex flex-col gap-4'
  }
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function fetchResults(keyword?: string) {
  if (!hasApi.value) return

  loading.value = true
  error.value = null

  try {
    const listFn = listApiFns[props.category]

    if (keyword && keyword.trim()) {
      // 第一步: 统一模糊搜索拿到多类型 ID 字典
      const result = await fuzzySearch(keyword.trim())
      // 第二步: 把整个字典传给 Schema API，由后端过滤
      schema.value = await listFn(result)
    } else {
      // 无关键词: 直接请求默认列表
      schema.value = await listFn()
    }
  } catch (e: any) {
    console.error('Failed to fetch results:', e)
    error.value = e.response?.data?.data || e.message || '加载失败'
    schema.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (hasApi.value) {
    fetchResults()
  }
})

// Debounced search on keyword change
watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchResults(val)
  }, 300)
})

watch(() => props.category, () => {
  searchQuery.value = ''
  schema.value = null
  error.value = null
  if (hasApi.value) {
    fetchResults()
  }
})
</script>

<template>
  <div class="p-6">
    <!-- 标题 -->
    <div class="mb-6" v-if="categoryInfo">
      <h1 class="text-2xl font-bold flex items-center gap-3">
        <component :is="categoryInfo.icon" class="size-7" />
        {{ categoryInfo.title }}
      </h1>
      <p v-if="categoryInfo.description" class="text-muted-foreground mt-1">{{ categoryInfo.description }}</p>
    </div>

    <!-- 未实现的功能占位 -->
    <template v-if="!hasApi">
      <div class="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
        <Construction class="size-16" />
        <p class="text-lg">此功能即将上线</p>
      </div>
    </template>

    <!-- 有 API 的功能 -->
    <template v-else>
      <ContentToolbar
        v-model:search="searchQuery"
        v-model:display-mode="displayMode"
        class="mb-4"
      />

      <!-- 加载中 -->
      <div v-if="loading" class="flex justify-center py-12">
        <Loader2 class="size-8 animate-spin text-muted-foreground" />
      </div>

      <!-- 错误 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-12 gap-3">
        <p class="text-destructive">{{ error }}</p>
        <button
          class="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
          @click="fetchResults(searchQuery)"
        >
          重试
        </button>
      </div>

      <!-- 结果列表 -->
      <div v-else-if="resultItems.length > 0" :class="gridClasses">
        <SchemaRenderer
          v-for="(child, index) in resultItems"
          :key="index"
          :node="child"
        />
      </div>

      <!-- 空结果 -->
      <div v-else-if="schema" class="text-center text-muted-foreground py-12">
        <p>没有匹配的结果</p>
      </div>
    </template>
  </div>
</template>
