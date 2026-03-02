<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { CanvasProps, CanvasCommand } from '@/core/types'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps<CanvasProps & { css?: Record<string, any> }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loading = ref(true)
const error = ref(false)

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

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

async function render() {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = props.width
  canvas.height = props.height
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  loading.value = true
  error.value = false

  try {
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
  <div class="relative inline-block" :style="{ width: `${props.width}px`, height: `${props.height}px`, ...props.css }">
    <canvas ref="canvasRef" class="block" />
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/80">
      <Loader2 class="size-6 animate-spin text-primary" />
    </div>
  </div>
</template>
