import * as React from 'react';
import { View } from 'react-native';

export type IconifyIconComponent = React.ComponentType<{
  name: string;
  size?: number;
  color?: string;
}>;

export type ClientIconifyIconProps = {
  loadIcon: () => Promise<IconifyIconComponent>;
  name: string;
  size?: number;
  color?: string;
};

/**
 * Renders an rn-iconify set icon after client mount. Avoids MMKV/localStorage
 * access during static web prerender (see iconify-loaders.ts).
 */
export function ClientIconifyIcon({
  loadIcon,
  name,
  size = 24,
  color,
}: ClientIconifyIconProps) {
  const [Icon, setIcon] = React.useState<IconifyIconComponent | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void loadIcon().then((component) => {
      if (!cancelled) {
        setIcon(() => component);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [loadIcon]);

  if (!Icon) {
    return (
      <View
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={name} size={size} color={color} />
    </View>
  );
}
