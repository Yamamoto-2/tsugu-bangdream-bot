<script setup lang="ts">
/**
 * 搜索列表视图
 * 流程: 本地 fuzzySearch(keyword, config) → Schema API 传 fuzzySearchResult + mode 渲染列表
 */
import { ref, computed, onMounted, watch } from 'vue'
import SchemaRenderer from '@/core/SchemaRenderer.vue'
import type { SchemaNode } from '@/core/types'
import ContentToolbar from '@/layouts/ContentToolbar.vue'
import { getFuzzySearchConfig, getEventList } from '@/api/schema'
import { fuzzySearch } from '@/lib/fuzzy-search'
import type { FuzzySearchConfig, FuzzySearchResult } from '@/lib/fuzzy-search'
import { navigationGroups } from '@/config/navigation'
import { useI18n } from '@/composables/useI18n'
import { Loader2, Construction } from 'lucide-vue-next'

const props = defineProps<{
  category: string
}>()

const { $t } = useI18n()

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

type DisplayMode = 'card' | 'table'

// 列表 Schema API 映射
const listApiFns: Record<string, (params?: { fuzzySearchResult?: FuzzySearchResult, ids?: number[], mode?: DisplayMode }) => Promise<SchemaNode>> = {
  event: (p) => getEventList({
    ...(p?.ids ? { eventId: p.ids } : {}),
    ...(p?.fuzzySearchResult ? { fuzzySearchResult: p.fuzzySearchResult } : {}),
    mode: p?.mode || 'card',
  }),
}

const hasApi = computed(() => props.category in listApiFns)

const searchQuery = ref('')
const displayMode = ref<DisplayMode>('card')
const schema = ref<SchemaNode | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const fsConfig = ref<FuzzySearchConfig | null>(null)

// 提取 container 节点 (Page > Container)，保留 container 自身的 CSS 控制布局
const resultContainer = computed<SchemaNode | null>(() => {
  if (!schema.value) return null
  return schema.value.children?.[0] || null
})

const hasResults = computed(() => {
  return resultContainer.value?.children && resultContainer.value.children.length > 0
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function fetchResults(keyword?: string) {
  if (!hasApi.value) return

  loading.value = true
  error.value = null

  try {
    const listFn = listApiFns[props.category]
    const mode = displayMode.value

    if (keyword && keyword.trim() && fsConfig.value) {
      // 第一步: 本地 fuzzySearch
      const result = fuzzySearch(keyword.trim(), fsConfig.value)
      // 第二步: 判断结果类型
      const keys = Object.keys(result)
      if (keys.length === 1 && keys[0] === '_number') {
        // 纯数字 → 直接用 ID 查询对应活动
        const ids = result['_number'].filter((v): v is number => typeof v === 'number')
        schema.value = await listFn({ ids, mode })
      } else {
        // 有属性匹配 → 传 fuzzySearchResult 让后端过滤
        schema.value = await listFn({ fuzzySearchResult: result, mode })
      }
    } else {
      // 无关键词: 直接请求默认列表
      schema.value = await listFn({ mode })
    }
  } catch (e: any) {
    console.error('Failed to fetch results:', e)
    error.value = e.response?.data?.data || e.message || '加载失败'
    schema.value = null
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (hasApi.value) {
    // 拉取 fuzzySearch 配置（支持 304 缓存）
    try {
      fsConfig.value = await getFuzzySearchConfig()
    } catch (e) {
      console.warn('Failed to load fuzzySearch config:', e)
    }
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

// 切换显示模式时重新请求（后端生成不同的 schema）
watch(displayMode, () => {
  fetchResults(searchQuery.value)
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
        {{ $t(categoryInfo.titleKey) }}
      </h1>
    </div>

    <!-- 未实现的功能占位 -->
    <template v-if="!hasApi">
      <div class="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
        <Construction class="size-16" />
        <p class="text-lg">{{ $t('search.comingSoon') }}</p>
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
          {{ $t('search.retry') }}
        </button>
      </div>

      <!-- 结果列表 (布局完全由后端 schema CSS 控制) -->
      <SchemaRenderer v-else-if="hasResults" :node="resultContainer!" />

      <!-- 空结果 -->
      <div v-else-if="schema" class="text-center text-muted-foreground py-12">
        <p>{{ $t('search.noResults') }}</p>
      </div>
    </template>
  </div>
</template>
