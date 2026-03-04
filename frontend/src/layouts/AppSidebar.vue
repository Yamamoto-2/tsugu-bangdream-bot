<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { navigationGroups } from '@/config/navigation'
import { useI18n } from '@/composables/useI18n'
import { Settings } from 'lucide-vue-next'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
const { $t } = useI18n()

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
      <div class="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:hidden">
        <span class="text-lg font-bold text-primary">Tsugu</span>
        <span class="text-xs text-muted-foreground">v5</span>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup v-for="group in navigationGroups" :key="group.titleKey">
        <SidebarGroupLabel>{{ $t(group.titleKey) }}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in group.items" :key="item.routeName">
            <SidebarMenuButton
              :tooltip="$t(item.titleKey)"
              :is-active="isActive(item.routePrefix)"
              @click="navigateTo(item.routeName)"
            >
              <component :is="item.icon" />
              <span>{{ $t(item.titleKey) }}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            :tooltip="$t('nav.settings')"
            :is-active="isActive('/settings')"
            @click="navigateTo('Settings')"
          >
            <Settings />
            <span>{{ $t('nav.settings') }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
