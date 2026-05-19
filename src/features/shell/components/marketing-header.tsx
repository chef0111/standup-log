import { Text } from '@/components/ui/text';
import { View } from 'react-native';

type MarketingHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

/** Vercel-style page intro: eyebrow, title, muted lead. */
export function MarketingHeader({
  eyebrow,
  title,
  description,
}: MarketingHeaderProps) {
  return (
    <View className="gap-2">
      {eyebrow ? (
        <Text className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
          {eyebrow}
        </Text>
      ) : null}
      <Text
        variant="h2"
        className="text-foreground border-0 pb-0 text-3xl tracking-tight"
      >
        {title}
      </Text>
      {description ? (
        <Text className="text-muted-foreground max-w-prose text-base leading-relaxed">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
