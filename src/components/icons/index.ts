/**
 * Icon presentation for the app.
 *
 * - Lucide + `Icon` from `@/components/ui/icon` for generic UI icons.
 * - GitHub brand icon via rn-iconify (`iconify-loaders.ts`, client-only).
 * - `RepositoryIcon` uses Lucide (Octicon repo glyphs are optically off-center in RN SVG).
 *
 * Routes and screens must import from this module — never `rn-iconify` directly.
 */

export { ClientIconifyIcon } from '@/components/icons/client-iconify-icon';
export type {
  ClientIconifyIconProps,
  IconifyIconComponent,
} from '@/components/icons/client-iconify-icon';
export { GithubIcon } from '@/components/icons/github-icon';
export { RepositoryIcon } from '@/components/icons/repository-icon';
