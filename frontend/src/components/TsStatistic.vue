<script setup lang="ts">
import type { StatisticProps } from '@/core/types'

const props = defineProps<StatisticProps>()
</script>

<template>
  <el-statistic
    :title="props.title"
    :value="props.value"
    :precision="props.precision"
    :prefix="props.prefix"
    :suffix="props.suffix"
    :value-style="props.valueStyle"
  />
</template>
