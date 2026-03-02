<script setup lang="ts">
import { computed } from 'vue'
import type { DescriptionsProps } from '@/core/types'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<DescriptionsProps & { css?: Record<string, any> }>(), {
  column: 3,
  direction: 'horizontal',
  size: 'default',
  border: true
})

const responsiveColumn = computed(() => {
  if (typeof window !== 'undefined' && window.innerWidth < 768) return 1
  return props.column
})
</script>

<template>
  <div class="mb-3 md:mb-5" :style="props.css">
    <h3 v-if="props.title" class="text-base font-semibold mb-3">{{ props.title }}</h3>
    <div
      :class="cn(
        'grid',
        props.border ? 'border rounded-lg overflow-hidden' : ''
      )"
      :style="{ gridTemplateColumns: props.direction === 'horizontal'
        ? `repeat(${responsiveColumn}, auto 1fr)`
        : `repeat(${responsiveColumn}, 1fr)` }"
    >
      <template v-for="(item, index) in props.items" :key="index">
        <template v-if="props.direction === 'horizontal'">
          <div
            :class="cn(
              'px-3 py-2 text-sm text-muted-foreground font-medium',
              props.border ? 'border-b border-r bg-muted/50' : ''
            )"
          >
            {{ item.label }}
          </div>
          <div
            :class="cn(
              'px-3 py-2 text-sm',
              props.border ? 'border-b' : ''
            )"
          >
            {{ item.value }}
          </div>
        </template>
        <template v-else>
          <div
            :class="cn('px-3 py-2', props.border ? 'border-b' : '')"
            :style="item.span ? { gridColumn: `span ${item.span}` } : {}"
          >
            <div class="text-sm text-muted-foreground font-medium">{{ item.label }}</div>
            <div class="text-sm mt-1">{{ item.value }}</div>
          </div>
        </template>
      </template>
    </div>
    <slot />
  </div>
</template>
