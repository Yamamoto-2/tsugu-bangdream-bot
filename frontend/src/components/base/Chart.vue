<template>
  <div class="tsugu-chart" :style="chartStyle">
    <canvas ref="chartCanvas" :width="width" :height="height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StyleMapper } from '@/core/StyleMapper';

Chart.register(...registerables);

interface Props {
  type?: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  data?: any;
  options?: any;
  width?: number;
  height?: number;
  _style?: any;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'line',
  width: 800,
  height: 400,
});

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const chartStyle = computed(() => {
  const style: Record<string, string> = {
    width: `${props.width}px`,
    height: `${props.height}px`,
  };

  // 合并自定义样式
  if (props._style) {
    const customStyle = StyleMapper.styleToCSS(props._style);
    Object.assign(style, customStyle);
  }

  return style;
});

onMounted(() => {
  if (chartCanvas.value) {
    const config: ChartConfiguration = {
      type: props.type,
      data: props.data || { labels: [], datasets: [] },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        ...props.options,
      },
    };

    chartInstance = new Chart(chartCanvas.value, config);
  }
});

watch(
  () => [props.data, props.options, props.type],
  () => {
    if (chartInstance && chartCanvas.value) {
      chartInstance.destroy();
      const config: ChartConfiguration = {
        type: props.type,
        data: props.data || { labels: [], datasets: [] },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          ...props.options,
        },
      };
      chartInstance = new Chart(chartCanvas.value, config);
    }
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
.tsugu-chart {
  box-sizing: border-box;
}
</style>

