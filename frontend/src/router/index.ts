import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // === Web 模式 (带 Layout) ===
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomeView.vue'),
        meta: { breadcrumb: '首页' }
      },
      // 活动
      {
        path: 'info/event',
        name: 'EventList',
        component: () => import('@/views/SearchView.vue'),
        props: { category: 'event' },
        meta: { breadcrumb: '活动' }
      },
      {
        path: 'info/event/:eventId',
        name: 'EventDetail',
        component: () => import('@/views/SchemaView.vue'),
        props: route => ({
          schemaType: 'eventDetail',
          params: {
            eventId: parseInt(route.params.eventId as string),
            displayedServerList: route.query.servers
              ? (route.query.servers as string).split(',').map(Number)
              : undefined,
            imageMode: route.query.imageMode as 'url' | 'base64' | undefined
          }
        }),
        meta: { breadcrumb: '活动详情', parent: 'EventList' }
      },
      // 歌曲
      {
        path: 'info/song',
        name: 'SongList',
        component: () => import('@/views/SearchView.vue'),
        props: { category: 'song' },
        meta: { breadcrumb: '歌曲' }
      },
      {
        path: 'info/song/:songId',
        name: 'SongDetail',
        component: () => import('@/views/SchemaView.vue'),
        props: route => ({
          schemaType: 'songDetail',
          params: { songId: parseInt(route.params.songId as string) }
        }),
        meta: { breadcrumb: '歌曲详情', parent: 'SongList' }
      },
      // 卡牌
      {
        path: 'info/card',
        name: 'CardList',
        component: () => import('@/views/SearchView.vue'),
        props: { category: 'card' },
        meta: { breadcrumb: '卡牌' }
      },
      // 角色
      {
        path: 'info/character',
        name: 'CharacterList',
        component: () => import('@/views/SearchView.vue'),
        props: { category: 'character' },
        meta: { breadcrumb: '角色' }
      },
      // 乐队
      {
        path: 'info/band',
        name: 'BandList',
        component: () => import('@/views/SearchView.vue'),
        props: { category: 'band' },
        meta: { breadcrumb: '乐队' }
      },
      // 抽卡
      {
        path: 'info/gacha',
        name: 'GachaList',
        component: () => import('@/views/SearchView.vue'),
        props: { category: 'gacha' },
        meta: { breadcrumb: '抽卡' }
      },
      // 玩家
      {
        path: 'info/player',
        name: 'PlayerList',
        component: () => import('@/views/SearchView.vue'),
        props: { category: 'player' },
        meta: { breadcrumb: '玩家' }
      },
      // 房间
      {
        path: 'room',
        name: 'RoomList',
        component: () => import('@/views/SearchView.vue'),
        props: { category: 'room' },
        meta: { breadcrumb: '房间' }
      },
      // 设置
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: { breadcrumb: '设置' }
      },
      // 演示
      {
        path: 'demo',
        name: 'Demo',
        component: () => import('@/views/DemoView.vue'),
        meta: { breadcrumb: '组件演示' }
      },
    ]
  },
  // === 旧路径重定向 ===
  { path: '/event', redirect: '/info/event' },
  { path: '/event/:eventId', redirect: to => `/info/event/${to.params.eventId}` },
  { path: '/song', redirect: '/info/song' },
  { path: '/song/:songId', redirect: to => `/info/song/${to.params.songId}` },
  // === Bot 模式 (无 Layout) ===
  {
    path: '/bot/event/:eventId',
    name: 'BotEventDetail',
    component: () => import('@/views/SchemaView.vue'),
    props: route => ({
      schemaType: 'eventDetail',
      params: {
        eventId: parseInt(route.params.eventId as string),
        displayedServerList: route.query.servers
          ? (route.query.servers as string).split(',').map(Number)
          : undefined,
        imageMode: route.query.imageMode as 'url' | 'base64' | undefined
      }
    })
  },
  {
    path: '/bot/song/:songId',
    name: 'BotSongDetail',
    component: () => import('@/views/SchemaView.vue'),
    props: route => ({
      schemaType: 'songDetail',
      params: { songId: parseInt(route.params.songId as string) }
    })
  },
  // === 404 ===
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
