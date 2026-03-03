<script setup lang="ts">
import { computed } from 'vue'
import type { ContainerProps } from '@/core/types'

const props = defineProps<ContainerProps & { css?: Record<string, any> }>()

// 当后端 css 传了 display/flexWrap 等布局属性时，不使用默认的 flex-col
const hasCustomLayout = computed(() => !!props.css?.display)
</script>

<template>
  <div
    class="mx-auto px-3 md:px-5"
    :class="hasCustomLayout ? '' : 'max-w-[1200px] flex flex-col gap-3 md:gap-5'"
    :style="css"
  >
    <slot />
  </div>
</template>
