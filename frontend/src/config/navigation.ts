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
  titleKey: string
  icon: Component
  routeName: string
  routePrefix: string
}

export interface NavGroup {
  titleKey: string
  items: NavSubItem[]
}

export const navigationGroups: NavGroup[] = [
  {
    titleKey: 'nav.info',
    items: [
      { titleKey: 'nav.event', icon: CalendarDays, routeName: 'EventList', routePrefix: '/info/event' },
      { titleKey: 'nav.song', icon: Music, routeName: 'SongList', routePrefix: '/info/song' },
      { titleKey: 'nav.card', icon: CreditCard, routeName: 'CardList', routePrefix: '/info/card' },
      { titleKey: 'nav.character', icon: Users, routeName: 'CharacterList', routePrefix: '/info/character' },
      { titleKey: 'nav.band', icon: Drum, routeName: 'BandList', routePrefix: '/info/band' },
      { titleKey: 'nav.gacha', icon: Gift, routeName: 'GachaList', routePrefix: '/info/gacha' },
      { titleKey: 'nav.player', icon: User, routeName: 'PlayerList', routePrefix: '/info/player' },
    ]
  },
  {
    titleKey: 'nav.room',
    items: [
      { titleKey: 'nav.roomList', icon: DoorOpen, routeName: 'RoomList', routePrefix: '/room' },
    ]
  }
]
