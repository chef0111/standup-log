import type { IconifyIconComponent } from '@/components/icons/client-iconify-icon';

/** Sole static import surface for rn-iconify — must stay out of route modules. */
export function loadMdiIconSet(): Promise<IconifyIconComponent> {
  return import('rn-iconify/icons/Mdi').then((module) => module.Mdi);
}
