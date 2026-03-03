<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { navigationGroups } from '@/config/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

const route = useRoute()
const router = useRouter()

function isActive(routePrefix: string) {
  return route.path === routePrefix || route.path.startsWith(routePrefix + '/')
}

function navigateTo(routeName: string) {
  router.push({ name: routeName })
}
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <div class="flex items-center gap-2 px-2 py-1">
        <span class="text-lg font-bold text-primary">Tsugu</span>
        <span class="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">v5</span>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup v-for="group in navigationGroups" :key="group.title">
        <SidebarGroupLabel>{{ group.title }}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in group.items" :key="item.routeName">
            <SidebarMenuButton
              :tooltip="item.title"
              :is-active="isActive(item.routePrefix)"
              @click="navigateTo(item.routeName)"
            >
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
