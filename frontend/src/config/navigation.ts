import type { Component } from 'vue'
import {
  CalendarDays,
  Music,
  CreditCard,
  Users,
  Drum,
  Gift,
  User,
  DoorOpen,
} from 'lucide-vue-next'

export interface NavSubItem {
  title: string
  icon: Component
  routeName: string
  routePrefix: string
  description?: string
}

export interface NavGroup {
  title: string
  items: NavSubItem[]
}

export const navigationGroups: NavGroup[] = [
  {
    title: '信息',
    items: [
      { title: '活动', icon: CalendarDays, routeName: 'EventList', routePrefix: '/info/event', description: '查看活动信息' },
      { title: '歌曲', icon: Music, routeName: 'SongList', routePrefix: '/info/song', description: '查看歌曲信息' },
      { title: '卡牌', icon: CreditCard, routeName: 'CardList', routePrefix: '/info/card', description: '查看卡牌信息' },
      { title: '角色', icon: Users, routeName: 'CharacterList', routePrefix: '/info/character', description: '查看角色信息' },
      { title: '乐队', icon: Drum, routeName: 'BandList', routePrefix: '/info/band', description: '查看乐队信息' },
      { title: '抽卡', icon: Gift, routeName: 'GachaList', routePrefix: '/info/gacha', description: '查看卡池信息' },
      { title: '玩家', icon: User, routeName: 'PlayerList', routePrefix: '/info/player', description: '查询玩家信息' },
    ]
  },
  {
    title: '房间',
    items: [
      { title: '房间列表', icon: DoorOpen, routeName: 'RoomList', routePrefix: '/room', description: '浏览多人房间' },
    ]
  }
]
