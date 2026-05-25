import {
  ClipboardList,
  History,
  Home,
  Settings,
  type LucideIcon,
} from 'lucide-react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

export type AppTabItem = {
  name: 'index' | 'standup' | 'history' | 'settings';
  href: '/' | '/standup' | '/history' | '/settings';
  label: string;
  sf: SFSymbol;
  md: string;
  icon: LucideIcon;
};

export const APP_TAB_ITEMS: AppTabItem[] = [
  {
    name: 'index',
    href: '/',
    label: 'Home',
    sf: 'house.fill',
    md: 'home',
    icon: Home,
  },
  {
    name: 'standup',
    href: '/standup',
    label: 'Standup',
    sf: 'doc.text',
    md: 'description',
    icon: ClipboardList,
  },
  {
    name: 'history',
    href: '/history',
    label: 'History',
    sf: 'clock.arrow.circlepath',
    md: 'history',
    icon: History,
  },
  {
    name: 'settings',
    href: '/settings',
    label: 'Settings',
    sf: 'gear',
    md: 'settings',
    icon: Settings,
  },
];
