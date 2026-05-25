import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatWorkdayHeading } from '@/features/standup/lib/compose-standup-markdown';
import type { StandupHistoryItem } from '@/features/standup/lib/history/standup-history-item';
import { ChevronRight, Trash2 } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

type StandupHistoryRowProps = {
  item: StandupHistoryItem;
  onPress: (workday: StandupHistoryItem['workday']) => void;
  onDeleteRequest: (workday: StandupHistoryItem['workday']) => void;
};

const DELETE_ACTION_WIDTH = 88;

export const StandupHistoryRow = React.memo(function StandupHistoryRow({
  item,
  onPress,
  onDeleteRequest,
}: StandupHistoryRowProps) {
  const heading = formatWorkdayHeading(item.workday);
  const subtitle =
    item.summaryExcerpt ?? 'Draft saved — open to review or copy.';

  const renderRightActions = React.useCallback(() => {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete standup for ${heading}`}
        onPress={() => {
          onDeleteRequest(item.workday);
        }}
        className="bg-destructive ml-2 items-center justify-center rounded-2xl"
        style={{ width: DELETE_ACTION_WIDTH }}
      >
        <Icon as={Trash2} size={20} className="text-white" />
        <Text className="text-xs font-medium text-white">
          Delete
        </Text>
      </Pressable>
    );
  }, [heading, item.workday, onDeleteRequest]);

  return (
    <ReanimatedSwipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={DELETE_ACTION_WIDTH / 2}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${heading}${item.copied ? ', copied' : ''}`}
        onPress={() => {
          onPress(item.workday);
        }}
        className="active:opacity-80"
      >
        <Card variant="elevated" className="flex-row items-center gap-3 p-4">
          <View className="min-w-0 flex-1 gap-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="text-foreground text-base font-semibold">
                {heading}
              </Text>
              {item.copied ? (
                <Badge variant="secondary">
                  <Text>Copied</Text>
                </Badge>
              ) : null}
            </View>
            <Text
              selectable
              className="text-muted-foreground text-sm leading-relaxed"
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          </View>
          <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
        </Card>
      </Pressable>
    </ReanimatedSwipeable>
  );
});
