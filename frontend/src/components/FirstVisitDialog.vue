<script setup lang="ts">
import { computed } from 'vue'
import { useSettings } from '@/composables/useSettings'
import { useI18n } from '@/composables/useI18n'
import SettingsPanel from '@/components/SettingsPanel.vue'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'

const settings = useSettings()
const { $t } = useI18n()

const open = computed({
  get: () => !settings.initialized,
  set: (val: boolean) => {
    if (!val) settings.initialized = true
  },
})

function confirm() {
  settings.initialized = true
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent side="bottom" class="max-h-[80vh] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{{ $t('welcome.title') }}</SheetTitle>
        <SheetDescription>{{ $t('welcome.description') }}</SheetDescription>
      </SheetHeader>
      <div class="px-4 py-2">
        <SettingsPanel />
      </div>
      <SheetFooter class="px-4 pb-4">
        <Button @click="confirm" class="w-full">{{ $t('welcome.confirm') }}</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
