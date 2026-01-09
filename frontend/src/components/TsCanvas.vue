<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { CanvasProps, CanvasCommand } from '@/core/types'

const props = defineProps<CanvasProps>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loading = ref(true)
const error = ref(false)

// 加载图片（不设置 crossOrigin 以避免 CORS 问题）
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// 执行单条绘图指令
async function executeCommand(
  ctx: CanvasRenderingContext2D,
  cmd: CanvasCommand,
  offsetX = 0,
  offsetY = 0
): Promise<void> {
  switch (cmd.type) {
    case 'drawImage': {
      try {
        const img = await loadImage(cmd.src)
        ctx.drawImage(img, cmd.x + offsetX, cmd.y + offsetY, cmd.w, cmd.h)
      } catch {
        // 图片加载失败，绘制占位符
        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(cmd.x + offsetX, cmd.y + offsetY, cmd.w, cmd.h)
      }
      break
    }
    case 'fillRect': {
      ctx.fillStyle = cmd.color
      ctx.fillRect(cmd.x + offsetX, cmd.y + offsetY, cmd.w, cmd.h)
      break
    }
    case 'fillText': {
      ctx.fillStyle = cmd.color
      ctx.font = cmd.font
      ctx.textAlign = cmd.align || 'left'
      ctx.textBaseline = cmd.baseline || 'alphabetic'
      ctx.fillText(cmd.text, cmd.x + offsetX, cmd.y + offsetY)
      break
    }
    case 'loop': {
      for (let i = 0; i < cmd.count; i++) {
        const loopOffsetX = (cmd.offsetX || 0) * i
        const loopOffsetY = (cmd.offsetY || 0) * i
        for (const subCmd of cmd.commands) {
          await executeCommand(ctx, subCmd, offsetX + loopOffsetX, offsetY + loopOffsetY)
        }
      }
      break
    }
  }
}

// 渲染 Canvas
async function render() {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置 canvas 尺寸
  canvas.width = props.width
  canvas.height = props.height

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  loading.value = true
  error.value = false

  try {
    // 执行所有绘图指令
    for (const cmd of props.commands) {
      await executeCommand(ctx, cmd)
    }
    loading.value = false
  } catch (e) {
    console.error('Canvas render error:', e)
    error.value = true
    loading.value = false
  }
}

// 监听 props 变化重新渲染
watch(
  () => [props.width, props.height, props.commands],
  () => render(),
  { deep: true }
)

onMounted(() => {
  render()
})
</script>

<template>
  <div class="ts-canvas" :style="{ width: `${props.width}px`, height: `${props.height}px` }">
    <canvas ref="canvasRef" class="canvas-element" />
    <div v-if="loading" class="loading-overlay">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>
  </div>
</template>

<style scoped>
.ts-canvas {
  position: relative;
  display: inline-block;
}

.canvas-element {
  display: block;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  font-size: 24px;
  color: var(--el-color-primary);
}
</style>
