<script setup lang="ts">
import SettingsPanel from '@/components/SettingsPanel.vue'
import { useI18n } from '@/composables/useI18n'
import { Settings } from 'lucide-vue-next'

const { $t } = useI18n()
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold flex items-center gap-3">
        <Settings class="size-7" />
        {{ $t('settings.title') }}
      </h1>
    </div>
    <div class="max-w-lg">
      <SettingsPanel />
    </div>
  </div>
</template>
