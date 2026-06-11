import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ItemCard } from '@/components/item-card';
import { ItemSearchHeader } from '@/components/item-search-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useItems } from '@/hooks/use-items';
import { API_BASE } from '@/services/api';
import { setSelectedItem } from '@/services/item-store';
import type { FilterType } from '@/types/item';
import { filterItems } from '@/utils/filter';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { items, loading, error, refreshing, onRefresh } = useItems();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredItems = filterItems(items, search, filter);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.centerState}>
            <ThemedText themeColor="textSecondary">Cargando...</ThemedText>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.centerState}>
            <ThemedText type="subtitle" style={styles.errorTitle}>Error de conexión</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.errorMsg}>{error}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.errorHint}>
              Verifica que el backend esté corriendo en {API_BASE}
            </ThemedText>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => {
                setSelectedItem(item);
                router.navigate('/detail/item');
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            items.length === 0 ? (
              <ThemedView style={styles.centerState}>
                <ThemedText type="subtitle" style={styles.emptyTitle}>No hay items</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.emptySubtitle}>
                  Crea tu primer item usando el tab "Crear"
                </ThemedText>
              </ThemedView>
            ) : (
              <ThemedView style={styles.centerState}>
                <ThemedText themeColor="textSecondary" style={styles.emptySubtitle}>
                  No se encontraron resultados
                </ThemedText>
              </ThemedView>
            )
          }
          ListHeaderComponent={
            <ItemSearchHeader
              search={search}
              onSearchChange={setSearch}
              filter={filter}
              onFilterChange={setFilter}
              resultCount={`${filteredItems.length} de ${items.length} items`}
            />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  listContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  centerState: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  emptyTitle: { textAlign: 'center' },
  emptySubtitle: { textAlign: 'center' },
  errorTitle: { textAlign: 'center', color: '#e74c3c' },
  errorMsg: { textAlign: 'center', fontSize: 13 },
  errorHint: { textAlign: 'center', fontSize: 12 },
});
