<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List } from 'lucide-vue-next'

const searchQuery = defineModel<string>('search', { default: '' })

type DisplayMode = 'card' | 'table'
const displayMode = defineModel<DisplayMode>('displayMode', { default: 'card' })
</script>

<template>
  <div class="flex items-center gap-3">
    <Input
      v-model="searchQuery"
      placeholder="搜索..."
      class="max-w-sm"
    />
    <div class="flex gap-1 ml-auto">
      <Button
        variant="ghost"
        size="sm"
        :class="displayMode === 'card' ? 'bg-accent' : ''"
        @click="displayMode = 'card'"
      >
        <LayoutGrid class="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        :class="displayMode === 'table' ? 'bg-accent' : ''"
        @click="displayMode = 'table'"
      >
        <List class="size-4" />
      </Button>
    </div>
  </div>
</template>
