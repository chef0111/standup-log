import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

type ProfileAvatarProps = {
  avatarUrl: string | null;
  displayName: string;
  size?: 'sm' | 'md';
  onPress?: () => void;
  className?: string;
};

const SIZES = {
  sm: { outer: 36, inner: 32, text: 'text-xs' },
  md: { outer: 44, inner: 40, text: 'text-sm' },
} as const;

export function ProfileAvatar({
  avatarUrl,
  displayName,
  size = 'md',
  onPress,
  className,
}: ProfileAvatarProps) {
  const dims = SIZES[size];
  const initial = (displayName[0] ?? '?').toUpperCase();

  const inner = avatarUrl ? (
    <Image
      source={{ uri: avatarUrl }}
      style={{
        width: dims.inner,
        height: dims.inner,
        borderRadius: dims.inner / 2,
      }}
    />
  ) : (
    <View
      className="bg-muted items-center justify-center rounded-full"
      style={{ width: dims.inner, height: dims.inner }}
    >
      <Text className={cn('text-foreground font-semibold', dims.text)}>
        {initial}
      </Text>
    </View>
  );

  const shell = (
    <View
      className={cn(
        'border-border/60 overflow-hidden rounded-full border p-0.5',
        className
      )}
      style={{ width: dims.outer, height: dims.outer }}
    >
      {inner}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Profile"
        onPress={onPress}
      >
        {shell}
      </Pressable>
    );
  }

  return shell;
}
