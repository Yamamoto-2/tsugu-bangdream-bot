// 布局组件
export { default as TsPage } from './TsPage.vue'
export { default as TsContainer } from './TsContainer.vue'
export { default as TsRow } from './TsRow.vue'
export { default as TsCol } from './TsCol.vue'
export { default as TsSpace } from './TsSpace.vue'

// UI 组件
export { default as TsText } from './TsText.vue'
export { default as TsTitle } from './TsTitle.vue'
export { default as TsImage } from './TsImage.vue'
export { default as TsTag } from './TsTag.vue'
export { default as TsDivider } from './TsDivider.vue'
export { default as TsLink } from './TsLink.vue'

// 容器组件
export { default as TsCard } from './TsCard.vue'
export { default as TsTable } from './TsTable.vue'
export { default as TsDescriptions } from './TsDescriptions.vue'

// 数据展示组件
export { default as TsChart } from './TsChart.vue'
export { default as TsStatistic } from './TsStatistic.vue'
export { default as TsProgress } from './TsProgress.vue'

// 反馈组件
export { default as TsAlert } from './TsAlert.vue'
export { default as TsEmpty } from './TsEmpty.vue'
export { default as TsSkeleton } from './TsSkeleton.vue'

// 组件映射表（用于 Schema 渲染器）
import type { Component } from 'vue'
import type { ComponentName } from '@/core/types'

import TsPage from './TsPage.vue'
import TsContainer from './TsContainer.vue'
import TsRow from './TsRow.vue'
import TsCol from './TsCol.vue'
import TsSpace from './TsSpace.vue'
import TsText from './TsText.vue'
import TsTitle from './TsTitle.vue'
import TsImage from './TsImage.vue'
import TsTag from './TsTag.vue'
import TsDivider from './TsDivider.vue'
import TsLink from './TsLink.vue'
import TsCard from './TsCard.vue'
import TsTable from './TsTable.vue'
import TsDescriptions from './TsDescriptions.vue'
import TsChart from './TsChart.vue'
import TsStatistic from './TsStatistic.vue'
import TsProgress from './TsProgress.vue'
import TsAlert from './TsAlert.vue'
import TsEmpty from './TsEmpty.vue'
import TsSkeleton from './TsSkeleton.vue'

export const componentMap: Record<ComponentName, Component> = {
  Page: TsPage,
  Container: TsContainer,
  Row: TsRow,
  Col: TsCol,
  Space: TsSpace,
  Text: TsText,
  Title: TsTitle,
  Image: TsImage,
  Tag: TsTag,
  Divider: TsDivider,
  Link: TsLink,
  Card: TsCard,
  Table: TsTable,
  Descriptions: TsDescriptions,
  Chart: TsChart,
  Statistic: TsStatistic,
  Progress: TsProgress,
  Alert: TsAlert,
  Empty: TsEmpty,
  Skeleton: TsSkeleton
}
