import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { ActivityIndicator } from 'react-native';
import { useStandup } from '../context/standup';
import { StandupEditor } from './standup-editor';

export function StandupDraftSection() {
  const { loading } = useStandup();

  return (
    <Card className="gap-3 p-4">
      <Text className="text-foreground text-sm font-medium">Standup draft</Text>
      {loading ? <ActivityIndicator /> : <StandupEditor />}
    </Card>
  );
}
