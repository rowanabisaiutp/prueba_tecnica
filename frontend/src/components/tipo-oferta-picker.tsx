import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AccentBlue, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { TipoOferta } from '@/types/item';

type Props = {
  value: TipoOferta;
  showMenu: boolean;
  onToggleMenu: () => void;
  onSelect: (value: TipoOferta) => void;
  hasError: boolean;
};

export function TipoOfertaPicker({ value, showMenu, onToggleMenu, onSelect, hasError }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.fieldGroup}>
      <ThemedText type="small" themeColor="textSecondary">Tipo de oferta *</ThemedText>
      <TouchableOpacity
        style={[styles.pickerButton, { borderColor: hasError ? '#e74c3c' : theme.backgroundElement, backgroundColor: theme.background }]}
        onPress={onToggleMenu}
        activeOpacity={0.7}
      >
        <ThemedText style={styles.pickerText}>
          {value === 'money' ? 'Descuento en dinero' : 'Descuento en porcentaje'}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{showMenu ? '▲' : '▼'}</ThemedText>
      </TouchableOpacity>
      {showMenu && (
        <ThemedView type="backgroundSelected" style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onSelect('money')}
          >
            <ThemedText>Descuento en dinero</ThemedText>
            {value === 'money' && <ThemedText style={styles.checkMark}>✓</ThemedText>}
          </TouchableOpacity>
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundElement }]} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onSelect('percentage')}
          >
            <ThemedText>Descuento en porcentaje</ThemedText>
            {value === 'percentage' && <ThemedText style={styles.checkMark}>✓</ThemedText>}
          </TouchableOpacity>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: Spacing.one,
  },
  pickerButton: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
  },
  menuContainer: {
    borderRadius: Spacing.two,
    overflow: 'hidden',
    marginTop: -Spacing.one,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  menuDivider: {
    height: 1,
  },
  checkMark: {
    color: AccentBlue,
    fontWeight: '700',
  },
});
