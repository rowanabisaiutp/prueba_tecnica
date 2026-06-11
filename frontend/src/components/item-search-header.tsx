import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AccentBlue, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { FilterType } from '@/types/item';
import { filterOptions } from '@/utils/filter';

type Props = {
  search: string;
  onSearchChange: (text: string) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  resultCount: string;
};

export function ItemSearchHeader({ search, onSearchChange, filter, onFilterChange, resultCount }: Props) {
  const theme = useTheme();

  return (
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
          onChangeText={onSearchChange}
          placeholder="Buscar por nombre o descripción..."
          placeholderTextColor={theme.textSecondary}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
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
                  filter === opt.value ? AccentBlue : theme.backgroundElement,
              },
            ]}
            onPress={() => onFilterChange(opt.value)}
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
        {resultCount}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
