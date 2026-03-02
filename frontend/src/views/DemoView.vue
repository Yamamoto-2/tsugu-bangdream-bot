<script setup lang="ts">
/**
 * 演示页面 - 展示所有组件
 */
import { ref } from 'vue'
import SchemaRenderer from '@/core/SchemaRenderer.vue'
import type { SchemaNode } from '@/core/types'

// 默认演示 Schema - 展示所有组件
const demoSchema: SchemaNode = {
  componentName: 'Page',
  props: {
    padding: '20px'
  },
  children: [
    {
      componentName: 'Container',
      children: [
        {
          componentName: 'Title',
          props: {
            level: 1,
            content: 'Tsugu Schema 渲染器 v2'
          }
        },
        {
          componentName: 'Alert',
          props: {
            title: '基于 shadcn-vue 重构',
            description: '使用 Schema 驱动的方式渲染 UI 组件，支持响应式布局',
            type: 'success',
            showIcon: true,
            closable: false
          }
        },
        {
          componentName: 'Divider',
          props: { contentPosition: 'left' },
          children: [{ componentName: 'Text', props: { content: '布局组件' } }]
        },
        {
          componentName: 'Row',
          props: { gutter: 20 },
          children: [
            {
              componentName: 'Col',
              props: { xs: 24, sm: 12, md: 8, lg: 6 },
              children: [
                {
                  componentName: 'Card',
                  props: { header: 'Col 响应式' },
                  children: [{ componentName: 'Text', props: { content: 'xs:24 sm:12 md:8 lg:6' } }]
                }
              ]
            },
            {
              componentName: 'Col',
              props: { xs: 24, sm: 12, md: 8, lg: 6 },
              children: [
                {
                  componentName: 'Card',
                  props: { header: 'Col 响应式' },
                  children: [{ componentName: 'Text', props: { content: 'xs:24 sm:12 md:8 lg:6' } }]
                }
              ]
            },
            {
              componentName: 'Col',
              props: { xs: 24, sm: 12, md: 8, lg: 6 },
              children: [
                {
                  componentName: 'Card',
                  props: { header: 'Col 响应式' },
                  children: [{ componentName: 'Text', props: { content: 'xs:24 sm:12 md:8 lg:6' } }]
                }
              ]
            },
            {
              componentName: 'Col',
              props: { xs: 24, sm: 12, md: 8, lg: 6 },
              children: [
                {
                  componentName: 'Card',
                  props: { header: 'Col 响应式' },
                  children: [{ componentName: 'Text', props: { content: 'xs:24 sm:12 md:8 lg:6' } }]
                }
              ]
            }
          ]
        },
        {
          componentName: 'Divider',
          props: { contentPosition: 'left' },
          children: [{ componentName: 'Text', props: { content: 'UI 组件' } }]
        },
        {
          componentName: 'Card',
          props: { header: 'Text 和 Title' },
          children: [
            { componentName: 'Title', props: { level: 2, content: '这是 H2 标题' } },
            { componentName: 'Title', props: { level: 3, content: '这是 H3 标题' } },
            {
              componentName: 'Space',
              props: { wrap: true },
              children: [
                { componentName: 'Text', props: { content: '默认文本' } },
                { componentName: 'Text', props: { content: 'Primary', type: 'primary' } },
                { componentName: 'Text', props: { content: 'Success', type: 'success' } },
                { componentName: 'Text', props: { content: 'Warning', type: 'warning' } },
                { componentName: 'Text', props: { content: 'Danger', type: 'danger' } },
                { componentName: 'Text', props: { content: 'Info', type: 'info' } }
              ]
            }
          ]
        },
        {
          componentName: 'Card',
          props: { header: 'Tag 标签' },
          children: [
            {
              componentName: 'Space',
              props: { wrap: true },
              children: [
                { componentName: 'Tag', props: { content: 'Default' } },
                { componentName: 'Tag', props: { content: 'Primary', type: 'primary' } },
                { componentName: 'Tag', props: { content: 'Success', type: 'success' } },
                { componentName: 'Tag', props: { content: 'Warning', type: 'warning' } },
                { componentName: 'Tag', props: { content: 'Danger', type: 'danger' } },
                { componentName: 'Tag', props: { content: 'Info', type: 'info' } },
                { componentName: 'Tag', props: { content: 'Round', type: 'primary', round: true } }
              ]
            }
          ]
        },
        {
          componentName: 'Divider',
          props: { contentPosition: 'left' },
          children: [{ componentName: 'Text', props: { content: '数据展示' } }]
        },
        {
          componentName: 'Card',
          props: { header: 'Descriptions 描述列表' },
          children: [
            {
              componentName: 'Descriptions',
              props: {
                title: '活动信息',
                items: [
                  { label: '活动名称', value: '星光闪耀演唱会' },
                  { label: '活动类型', value: 'Live' },
                  { label: '开始时间', value: '2024-01-01 12:00' },
                  { label: '结束时间', value: '2024-01-07 20:59' },
                  { label: '属性加成', value: 'Cool +20%' },
                  { label: '角色加成', value: '香澄, 有咲' }
                ],
                column: 2,
                border: true
              }
            }
          ]
        },
        {
          componentName: 'Card',
          props: { header: 'Table 表格' },
          children: [
            {
              componentName: 'Table',
              props: {
                data: [
                  { rank: 1, name: 'Player1', score: 1500000 },
                  { rank: 2, name: 'Player2', score: 1400000 },
                  { rank: 3, name: 'Player3', score: 1300000 },
                  { rank: 4, name: 'Player4', score: 1200000 },
                  { rank: 5, name: 'Player5', score: 1100000 }
                ],
                columns: [
                  { prop: 'rank', label: '排名', width: 80, align: 'center' },
                  { prop: 'name', label: '玩家', minWidth: 120 },
                  { prop: 'score', label: '分数', align: 'right' }
                ],
                stripe: true,
                border: true
              }
            }
          ]
        },
        {
          componentName: 'Card',
          props: { header: 'Statistic 统计数值' },
          children: [
            {
              componentName: 'Row',
              props: { gutter: 20 },
              children: [
                {
                  componentName: 'Col',
                  props: { span: 8 },
                  children: [
                    { componentName: 'Statistic', props: { title: '活动参与人数', value: 125890 } }
                  ]
                },
                {
                  componentName: 'Col',
                  props: { span: 8 },
                  children: [
                    { componentName: 'Statistic', props: { title: '当前档线', value: 1523456, suffix: 'pt' } }
                  ]
                },
                {
                  componentName: 'Col',
                  props: { span: 8 },
                  children: [
                    { componentName: 'Statistic', props: { title: '增长率', value: 12.5, precision: 1, suffix: '%' } }
                  ]
                }
              ]
            }
          ]
        },
        {
          componentName: 'Card',
          props: { header: 'Progress 进度条' },
          children: [
            {
              componentName: 'Space',
              props: { direction: 'vertical', fill: true, size: 'large' },
              children: [
                { componentName: 'Progress', props: { percentage: 50 } },
                { componentName: 'Progress', props: { percentage: 100, status: 'success' } },
                { componentName: 'Progress', props: { percentage: 70, status: 'warning' } },
                { componentName: 'Progress', props: { percentage: 30, status: 'exception' } }
              ]
            }
          ]
        },
        {
          componentName: 'Divider',
          props: { contentPosition: 'left' },
          children: [{ componentName: 'Text', props: { content: '图表组件' } }]
        },
        {
          componentName: 'Card',
          props: { header: 'Chart 图表' },
          children: [
            {
              componentName: 'Chart',
              props: {
                type: 'line',
                height: 300,
                data: {
                  labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                  datasets: [
                    {
                      label: '档线预测',
                      data: [120000, 250000, 380000, 520000, 680000, 850000],
                      borderColor: '#409EFF',
                      backgroundColor: 'rgba(64, 158, 255, 0.1)',
                      fill: true,
                      tension: 0.4
                    },
                    {
                      label: '实际档线',
                      data: [115000, 245000, 390000, 510000, 695000, 830000],
                      borderColor: '#67C23A',
                      backgroundColor: 'rgba(103, 194, 58, 0.1)',
                      fill: true,
                      tension: 0.4
                    }
                  ]
                },
                options: {
                  plugins: { legend: { display: true, position: 'top' } },
                  scales: { y: { beginAtZero: true } }
                }
              }
            }
          ]
        },
        {
          componentName: 'Divider',
          props: { contentPosition: 'left' },
          children: [{ componentName: 'Text', props: { content: '反馈组件' } }]
        },
        {
          componentName: 'Space',
          props: { direction: 'vertical', fill: true },
          children: [
            { componentName: 'Alert', props: { title: 'Success 提示', type: 'success', showIcon: true } },
            { componentName: 'Alert', props: { title: 'Info 提示', type: 'info', showIcon: true } },
            { componentName: 'Alert', props: { title: 'Warning 提示', type: 'warning', showIcon: true } },
            { componentName: 'Alert', props: { title: 'Error 提示', type: 'error', showIcon: true } }
          ]
        },
        {
          componentName: 'Card',
          props: { header: 'Empty 空状态' },
          children: [
            { componentName: 'Empty', props: { description: '暂无数据' } }
          ]
        }
      ]
    }
  ]
}

const schema = ref<SchemaNode>(demoSchema)
</script>

<template>
  <SchemaRenderer :node="schema" />
</template>
