<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const route = useRoute()
const router = useRouter()

interface BreadcrumbEntry {
  label: string
  routeName?: string
}

const breadcrumbs = computed<BreadcrumbEntry[]>(() => {
  const crumbs: BreadcrumbEntry[] = [{ label: '首页', routeName: 'Home' }]

  // 向上遍历 parent 链
  const visited = new Set<string>()
  const chain: BreadcrumbEntry[] = []
  let currentMeta = route.meta as { breadcrumb?: string; parent?: string }

  while (currentMeta?.parent && !visited.has(currentMeta.parent)) {
    visited.add(currentMeta.parent)
    const parentRoute = router.getRoutes().find(r => r.name === currentMeta.parent)
    if (parentRoute) {
      chain.unshift({
        label: (parentRoute.meta?.breadcrumb as string) || currentMeta.parent,
        routeName: currentMeta.parent
      })
      currentMeta = parentRoute.meta as typeof currentMeta
    } else {
      break
    }
  }

  crumbs.push(...chain)

  // 当前页
  if (route.meta?.breadcrumb && route.name !== 'Home') {
    crumbs.push({ label: route.meta.breadcrumb as string })
  }

  return crumbs
})
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList>
      <template v-for="(crumb, index) in breadcrumbs" :key="index">
        <BreadcrumbItem :class="index < breadcrumbs.length - 1 ? 'hidden md:block' : ''">
          <BreadcrumbLink
            v-if="crumb.routeName && index < breadcrumbs.length - 1"
            as-child
          >
            <router-link :to="{ name: crumb.routeName }">
              {{ crumb.label }}
            </router-link>
          </BreadcrumbLink>
          <BreadcrumbPage v-else>
            {{ crumb.label }}
          </BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator
          v-if="index < breadcrumbs.length - 1"
          :class="index < breadcrumbs.length - 2 ? 'hidden md:block' : ''"
        />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
