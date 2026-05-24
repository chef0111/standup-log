import {
  Calendar,
  ClipboardList,
  Home,
  Settings,
  type LucideIcon,
} from 'lucide-react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

export type AppTabItem = {
  name: 'index' | 'standup' | 'weekly' | 'settings';
  href: '/' | '/standup' | '/weekly' | '/settings';
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
    name: 'weekly',
    href: '/weekly',
    label: 'Weekly',
    sf: 'calendar',
    md: 'calendar_month',
    icon: Calendar,
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
