import { Stack } from 'expo-router';

export default function WeeklyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackTitle: 'Back',
      }}
    />
  );
}
