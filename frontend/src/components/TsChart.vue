<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  ArcElement,
  PieController,
  DoughnutController,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { ChartProps } from '@/core/types'

// 注册 Chart.js 组件
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  ArcElement,
  PieController,
  DoughnutController,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = withDefaults(defineProps<ChartProps>(), {
  type: 'line',
  width: '100%',
  height: 300
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const createChart = () => {
  if (!canvasRef.value || !props.data) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(canvasRef.value, {
    type: props.type as any,
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      ...props.options
    }
  })
}

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})

watch(() => [props.data, props.options, props.type], () => {
  createChart()
}, { deep: true })
</script>

<template>
  <div
    class="ts-chart"
    :style="{
      width: typeof props.width === 'number' ? `${props.width}px` : props.width,
      height: typeof props.height === 'number' ? `${props.height}px` : props.height
    }"
  >
    <canvas ref="canvasRef" />
  </div>
</template>

<style scoped>
.ts-chart {
  position: relative;
}

.ts-chart canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
