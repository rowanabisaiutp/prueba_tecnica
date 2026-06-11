import { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getItems } from '@/services/api';
import { setSelectedItem } from '@/services/item-store';
import type { Item, TipoOferta } from '@/types/item';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

function formatDiscount(item: Item) {
  return item.tipoOferta === 'percentage'
    ? `${item.descuento}%`
    : `$${item.descuento.toFixed(2)}`;
}

type FilterType = 'all' | TipoOferta;

function ItemCard({ item, onPress }: { item: Item; onPress: () => void }) {  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold" style={styles.cardTitle}>{item.nombre}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {item.descripcion}
        </ThemedText>
        <ThemedView style={styles.cardRow}>
          <ThemedView style={styles.cardCol}>
            <ThemedText type="small" themeColor="textSecondary">Precio</ThemedText>
            <ThemedText type="smallBold">${item.precio.toFixed(2)}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.cardCol}>
            <ThemedText type="small" themeColor="textSecondary">Descuento</ThemedText>
            <ThemedText type="smallBold">{formatDiscount(item)}</ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.cardRow}>
          <ThemedView style={styles.cardCol}>
            <ThemedText type="small" themeColor="textSecondary">Inicio</ThemedText>
            <ThemedText type="small">{formatDate(item.fechaInicio)}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.cardCol}>
            <ThemedText type="small" themeColor="textSecondary">Fin</ThemedText>
            <ThemedText type="small">{formatDate(item.fechaFin)}</ThemedText>
          </ThemedView>
        </ThemedView>
        {item.multimedia.length > 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            {item.multimedia.length} archivo(s) multimedia
          </ThemedText>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  async function loadItems() {
    try {
      setError(null);
      const data = await getItems();
      setItems(data);
    } catch (e: any) {
      console.error('Error cargando items:', e?.message);
      setError(e?.message || 'Error al cargar items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function onRefresh() {
    setRefreshing(true);
    loadItems();
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !search.trim() ||
      item.nombre.toLowerCase().includes(search.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'all' || item.tipoOferta === filter;

    return matchesSearch && matchesFilter;
  });

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Dinero', value: 'money' },
    { label: 'Porcentaje', value: 'percentage' },
  ];

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
              Verifica que el backend esté corriendo en http://192.168.2.115:4000
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
            <View style={styles.headerSection}>
              <View
                style={[
                  styles.searchBar,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
                ]}
              >
                <ThemedText themeColor="textSecondary" style={styles.searchIcon}>🔍</ThemedText>
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Buscar por nombre o descripción..."
                  placeholderTextColor={theme.textSecondary}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <ThemedText themeColor="textSecondary" style={styles.clearIcon}>✕</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.filterRow}>
                {filterOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          filter === opt.value ? '#208AEF' : theme.backgroundElement,
                      },
                    ]}
                    onPress={() => setFilter(opt.value)}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      style={[
                        styles.filterChipText,
                        filter === opt.value && styles.filterChipActive,
                      ]}
                    >
                      {opt.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              <ThemedText type="small" themeColor="textSecondary" style={styles.resultCount}>
                {filteredItems.length} de {items.length} items
              </ThemedText>
            </View>
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  headerSection: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Spacing.two,
  },
  clearIcon: {
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: Spacing.one,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipActive: {
    color: '#fff',
    fontWeight: '700',
  },
  resultCount: {
    fontSize: 12,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardTitle: {
    fontSize: 18,
  },
  cardRow: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  cardCol: {
    gap: 2,
  },
  centerState: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  errorTitle: {
    textAlign: 'center',
    color: '#e74c3c',
  },
  errorMsg: {
    textAlign: 'center',
    fontSize: 13,
  },
  errorHint: {
    textAlign: 'center',
    fontSize: 12,
  },
});
