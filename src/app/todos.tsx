import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/utils/supabase';

type TodoRow = { id: string; name?: string | null };

export default function TodosScreen() {
  const theme = useTheme();
  const [todos, setTodos] = useState<TodoRow[]>([]);

  useEffect(() => {
    const getTodos = async () => {
      try {
        const { data, error } = await supabase.from('todos').select();

        if (error) {
          console.error('Error fetching todos:', error.message);
          return;
        }

        if (data && data.length > 0) {
          setTodos(data as TodoRow[]);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Error fetching todos:', message);
      }
    };

    void getTodos();
  }, []);

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safe}>
        <ThemedText type="title">Todo List</ThemedText>
        <FlatList
          style={styles.list}
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ThemedText>{item.name ?? '(no name)'}</ThemedText>}
          ListEmptyComponent={
            <ThemedText themeColor="textSecondary">No todos loaded.</ThemedText>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
    alignItems: 'stretch',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  list: {
    marginTop: Spacing.three,
    alignSelf: 'stretch',
  },
});
