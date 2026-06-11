import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function DetailLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitle: 'Detalle',
        headerBackTitle: 'Items',
      }}
    />
  );
}
