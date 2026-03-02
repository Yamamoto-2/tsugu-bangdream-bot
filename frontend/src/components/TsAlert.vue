<script setup lang="ts">
import { ref } from 'vue'
import type { AlertProps } from '@/core/types'
import { cn } from '@/lib/utils'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { CircleCheck, CircleAlert, Info, XCircle, X } from 'lucide-vue-next'

const props = withDefaults(defineProps<AlertProps & { css?: Record<string, any> }>(), {
  type: 'info',
  effect: 'light',
  closable: true,
  showIcon: true
})

const visible = ref(true)

const typeConfig: Record<string, { icon: any; class: string }> = {
  success: { icon: CircleCheck, class: 'border-green-200 bg-green-50 text-green-800 [&>svg]:text-green-500' },
  warning: { icon: CircleAlert, class: 'border-yellow-200 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-500' },
  info:    { icon: Info,        class: 'border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-500' },
  error:   { icon: XCircle,     class: 'border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-500' }
}
</script>

<template>
  <Alert
    v-if="visible"
    :class="cn(typeConfig[props.type ?? 'info'].class)"
    :style="props.css"
  >
    <component v-if="props.showIcon" :is="typeConfig[props.type ?? 'info'].icon" class="size-4" />
    <AlertTitle v-if="props.title">{{ props.title }}</AlertTitle>
    <AlertDescription v-if="props.description">{{ props.description }}</AlertDescription>
    <button
      v-if="props.closable"
      class="absolute right-3 top-3 opacity-50 hover:opacity-100 transition-opacity"
      @click="visible = false"
    >
      <X class="size-4" />
    </button>
  </Alert>
</template>
