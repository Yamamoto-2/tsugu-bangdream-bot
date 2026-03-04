<script setup lang="ts">
import AppSidebar from '@/layouts/AppSidebar.vue'
import AppBreadcrumb from '@/layouts/AppBreadcrumb.vue'
import FirstVisitDialog from '@/components/FirstVisitDialog.vue'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <FirstVisitDialog />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
          <AppBreadcrumb />
        </div>
      </header>
      <div class="flex flex-1 flex-col">
        <router-view />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
