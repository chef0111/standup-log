import { ClientIconifyIcon } from '@/components/icons/client-iconify-icon';
import { loadMdiIconSet } from '@/components/icons/iconify-loaders';
import * as React from 'react';

type GithubIconProps = {
  size?: number;
  color?: string;
};

export function GithubIcon({ size = 24, color }: GithubIconProps) {
  return (
    <ClientIconifyIcon
      loadIcon={loadMdiIconSet}
      name="github"
      size={size}
      color={color}
    />
  );
}
