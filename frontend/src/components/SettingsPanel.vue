<script setup lang="ts">
import { useSettings } from '@/composables/useSettings'
import { useI18n } from '@/composables/useI18n'
import { Button } from '@/components/ui/button'

const settings = useSettings()
const { $t } = useI18n()

const languages = [
  { value: 'zh' as const, label: '中文' },
  { value: 'en' as const, label: 'English' },
  { value: 'ja' as const, label: '日本語' },
]

const servers = [
  { value: 0, label: 'JP' },
  { value: 1, label: 'EN' },
  { value: 2, label: 'TW' },
  { value: 3, label: 'CN' },
  { value: 4, label: 'KR' },
]

function toggleServer(value: number) {
  const idx = settings.displayedServerList.indexOf(value)
  if (idx >= 0) {
    if (settings.displayedServerList.length > 1) {
      settings.displayedServerList.splice(idx, 1)
    }
  } else {
    settings.displayedServerList.push(value)
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- 语言 -->
    <div>
      <h3 class="text-sm font-medium mb-3">{{ $t('settings.language') }}</h3>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="lang in languages"
          :key="lang.value"
          :variant="settings.language === lang.value ? 'default' : 'outline'"
          size="sm"
          @click="settings.language = lang.value"
        >
          {{ lang.label }}
        </Button>
      </div>
    </div>

    <!-- 服务器 -->
    <div>
      <h3 class="text-sm font-medium mb-3">{{ $t('settings.servers') }}</h3>
      <p class="text-xs text-muted-foreground mb-3">{{ $t('settings.serversHint') }}</p>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="server in servers"
          :key="server.value"
          :variant="settings.displayedServerList.includes(server.value) ? 'default' : 'outline'"
          size="sm"
          @click="toggleServer(server.value)"
        >
          {{ server.label }}
        </Button>
      </div>
      <div v-if="settings.displayedServerList.length > 0" class="mt-2 text-xs text-muted-foreground">
        {{ $t('settings.serverOrder') }}: {{ settings.displayedServerList.map(v => servers.find(s => s.value === v)?.label).join(' → ') }}
      </div>
    </div>
  </div>
</template>
