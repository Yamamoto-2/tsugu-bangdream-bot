<script setup lang="ts">
import type { CardProps } from '@/core/types'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const props = withDefaults(defineProps<CardProps & { css?: Record<string, any> }>(), {
  shadow: 'hover'
})

const shadowClass: Record<string, string> = {
  always: 'shadow-md',
  hover: 'shadow-sm hover:shadow-md transition-shadow',
  never: 'shadow-none'
}
</script>

<template>
  <Card
    :class="cn('mb-3 md:mb-5', shadowClass[props.shadow ?? 'hover'])"
    :style="props.css"
  >
    <CardHeader v-if="props.header">
      <CardTitle class="text-base font-semibold">{{ props.header }}</CardTitle>
    </CardHeader>
    <CardContent :style="props.bodyStyle">
      <slot />
    </CardContent>
  </Card>
</template>
