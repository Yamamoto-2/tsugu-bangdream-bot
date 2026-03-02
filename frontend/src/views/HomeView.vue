<script setup lang="ts">
/**
 * 首页 - 导航和快速访问
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ArrowRight } from 'lucide-vue-next'

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

const routes = [
  { path: '/event/:eventId', description: '活动详情', example: '/event/123' },
  { path: '/event/:eventId/preview', description: '活动预览', example: '/event/123/preview' },
  { path: '/demo', description: '组件演示', example: '/demo' },
]
</script>

<template>
  <div class="min-h-screen bg-muted px-5 py-10">
    <div class="mx-auto max-w-[800px]">
      <h1 class="text-4xl font-bold text-foreground mb-2">Tsugu v5 渲染器</h1>
      <p class="text-lg text-muted-foreground">Schema 驱动的 BangDream 数据展示</p>

      <Separator class="my-6" />

      <div class="flex flex-col md:flex-row gap-4">
        <h3 class="text-lg font-semibold w-full md:hidden">快速访问</h3>

        <Card class="flex-1">
          <CardHeader>
            <CardTitle class="text-base">活动详情</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex gap-2">
              <input
                v-model="eventId"
                placeholder="输入活动 ID"
                class="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                @keyup.enter="goToEventDetail"
              />
              <button
                class="inline-flex items-center justify-center h-9 px-3 rounded-md border border-input bg-background text-sm shadow-xs hover:bg-accent transition-colors"
                @click="goToEventDetail"
              >
                <ArrowRight class="size-4" />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card class="flex-1">
          <CardHeader>
            <CardTitle class="text-base">示例页面</CardTitle>
          </CardHeader>
          <CardContent>
            <button
              class="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow-xs hover:bg-primary/90 transition-colors"
              @click="goToDemo"
            >
              查看组件演示
            </button>
          </CardContent>
        </Card>
      </div>

      <Separator class="my-6" />

      <div>
        <h3 class="text-lg font-semibold mb-4">API 路由</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[200px]">路径</TableHead>
              <TableHead>说明</TableHead>
              <TableHead class="w-[200px]">示例</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(route, i) in routes" :key="i" :class="i % 2 === 1 ? 'bg-muted/50' : ''">
              <TableCell>{{ route.path }}</TableCell>
              <TableCell>{{ route.description }}</TableCell>
              <TableCell>{{ route.example }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>
