import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MediaViewer } from '@/components/media-viewer';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AccentBlue, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getSelectedItem } from '@/services/item-store';
import { formatDate, formatDiscount } from '@/utils/format';
import { calculateFinalPrice, getMediaUrl } from '@/utils/media';

export default function DetailScreen() {
  const theme = useTheme();
  const item = getSelectedItem();

  if (!item) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.centerState}>
            <ThemedText type="subtitle">Item no encontrado</ThemedText>
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const firstImage = item.multimedia.find((m) => m.mimetype.startsWith('image/'));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {firstImage && (
            <Image
              source={{ uri: getMediaUrl(firstImage) }}
              style={styles.heroImage}
              contentFit="cover"
            />
          )}

          <View style={styles.content}>
            <ThemedText type="subtitle" style={styles.itemName}>{item.nombre}</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.itemDesc}>
              {item.descripcion}
            </ThemedText>

            <ThemedView type="backgroundElement" style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <ThemedText type="small" themeColor="textSecondary">Precio</ThemedText>
                  <ThemedText type="smallBold" style={styles.infoValue}>
                    ${item.precio.toFixed(2)}
                  </ThemedText>
                </View>
                <View style={[styles.infoDivider, { backgroundColor: theme.background }]} />
                <View style={styles.infoItem}>
                  <ThemedText type="small" themeColor="textSecondary">Descuento</ThemedText>
                  <ThemedText type="smallBold" style={styles.infoValue}>
                    {formatDiscount(item)}
                  </ThemedText>
                </View>
                <View style={[styles.infoDivider, { backgroundColor: theme.background }]} />
                <View style={styles.infoItem}>
                  <ThemedText type="small" themeColor="textSecondary">Tipo</ThemedText>
                  <ThemedText type="smallBold" style={styles.infoValue}>
                    {item.tipoOferta === 'money' ? 'Dinero' : 'Porcentaje'}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>

            <ThemedView type="backgroundElement" style={styles.priceCard}>
              <ThemedText type="small" themeColor="textSecondary">Precio final</ThemedText>
              <ThemedText style={styles.finalPrice}>
                ${calculateFinalPrice(item).toFixed(2)}
              </ThemedText>
            </ThemedView>

            <ThemedView type="backgroundElement" style={styles.datesCard}>
              <ThemedText type="smallBold" style={styles.sectionLabel}>Vigencia</ThemedText>
              <View style={styles.dateRow}>
                <View style={styles.dateItem}>
                  <ThemedText type="small" themeColor="textSecondary">Inicio</ThemedText>
                  <ThemedText type="smallBold">{formatDate(item.fechaInicio)}</ThemedText>
                </View>
                <View style={styles.dateItem}>
                  <ThemedText type="small" themeColor="textSecondary">Fin</ThemedText>
                  <ThemedText type="smallBold">{formatDate(item.fechaFin)}</ThemedText>
                </View>
              </View>
            </ThemedView>

            {item.multimedia.length > 0 && (
              <MediaViewer mediaList={item.multimedia} />
            )}

            <ThemedText type="small" themeColor="textSecondary" style={styles.createdAt}>
              Creado: {formatDate(item.createdAt)}
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  itemName: { fontSize: 24, lineHeight: 30 },
  itemDesc: { fontSize: 15, lineHeight: 22 },
  infoCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoDivider: {
    width: 1,
    height: 40,
  },
  infoValue: { fontSize: 16 },
  priceCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 4,
  },
  finalPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: AccentBlue,
  },
  datesCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionLabel: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  dateItem: { gap: 2 },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createdAt: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: Spacing.three,
  },
});
