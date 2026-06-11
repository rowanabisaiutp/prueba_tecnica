import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Item } from '@/types/item';
import { formatDate, formatDiscount } from '@/utils/format';

export function ItemCard({ item, onPress }: { item: Item; onPress: () => void }) {
  return (
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

const styles = StyleSheet.create({
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
});
