<template>
  <div id="app">
    <SchemaRenderer v-if="schema" :node="schema" />
    <div v-else class="tsugu-loading">加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SchemaRenderer from '@/core/SchemaRenderer.vue';
import { SchemaNode } from '@/core/types';

// 默认测试 Schema
const defaultSchema: SchemaNode = {
  componentName: 'Page',
  props: {
    useEasyBG: true,
    startWithSpace: true,
  },
  children: [
    {
      componentName: 'Column',
      props: {
        gap: 30,
      },
      style: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: 'md',
      },
      children: [
        {
          componentName: 'Card',
          props: {
            showBackground: true,
          },
          children: [
            {
              componentName: 'Text',
              props: {
                text: '欢迎使用 Tsugu Renderer！',
                textSize: 40,
              },
            },
            {
              componentName: 'Spacer',
              props: {
                height: 20,
              },
            },
            {
              componentName: 'Table',
              props: {
                key: '测试',
                text: '这是一个测试表格',
              },
            },
            {
              componentName: 'Divider',
            },
            {
              componentName: 'Badge',
              props: {
                text: '标签',
              },
            },
          ],
        },
      ],
    },
  ],
};

const schema = ref<SchemaNode | null>(defaultSchema);

onMounted(() => {
  // 从 window 获取 Schema（Bot 注入）
  if ((window as any).__TSUGU_SCHEMA__) {
    schema.value = (window as any).__TSUGU_SCHEMA__;
  }

  // 监听自定义事件
  window.addEventListener('tsugu:render', ((event: CustomEvent) => {
    schema.value = event.detail.schema || event.detail;
  }) as EventListener);
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft Yahei', sans-serif;
  background-color: #f5f5f5;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.tsugu-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 24px;
  color: #666;
}
</style>


