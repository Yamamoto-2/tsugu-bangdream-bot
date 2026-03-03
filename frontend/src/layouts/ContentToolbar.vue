<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List, GalleryHorizontalEnd } from 'lucide-vue-next'

const searchQuery = defineModel<string>('search', { default: '' })

type DisplayMode = 'grid' | 'list' | 'large'
const displayMode = defineModel<DisplayMode>('displayMode', { default: 'grid' })
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
        :class="displayMode === 'grid' ? 'bg-accent' : ''"
        @click="displayMode = 'grid'"
      >
        <LayoutGrid class="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        :class="displayMode === 'list' ? 'bg-accent' : ''"
        @click="displayMode = 'list'"
      >
        <List class="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        :class="displayMode === 'large' ? 'bg-accent' : ''"
        @click="displayMode = 'large'"
      >
        <GalleryHorizontalEnd class="size-4" />
      </Button>
    </div>
  </div>
</template>
