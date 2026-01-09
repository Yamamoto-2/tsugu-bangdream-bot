/**
 * Vue Router 配置
 */

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/event/:eventId',
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
    })
  },
  {
    path: '/event/:eventId/preview',
    name: 'EventPreview',
    component: () => import('@/views/SchemaView.vue'),
    props: route => ({
      schemaType: 'eventPreview',
      params: {
        eventId: parseInt(route.params.eventId as string),
        displayedServerList: route.query.servers
          ? (route.query.servers as string).split(',').map(Number)
          : undefined
      }
    })
  },
  {
    path: '/demo',
    name: 'Demo',
    component: () => import('@/views/DemoView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
