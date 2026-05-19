import * as React from 'react';
import { Mdi } from 'rn-iconify/icons/Mdi';

type GithubIconProps = {
  size?: number;
  color?: string;
};

export function GithubIcon({ size = 24, color }: GithubIconProps) {
  return <Mdi name="github" size={size} color={color} />;
}
