import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { API_BASE } from '@/services/api';
import { getSelectedItem } from '@/services/item-store';
import type { Item, ItemMedia } from '@/types/item';

function getMediaUrl(media: ItemMedia): string {
  const filename = media.filename || media.path?.split('/').pop();
  if (!filename) return '';
  return `${API_BASE.replace('/api', '')}/uploads/${filename}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDiscount(item: Item) {
  return item.tipoOferta === 'percentage'
    ? `${item.descuento}%`
    : `$${item.descuento.toFixed(2)}`;
}

function MediaViewer({ mediaList }: { mediaList: ItemMedia[] }) {
  return (
    <View style={styles.mediaSection}>
      <ThemedText type="smallBold" style={styles.sectionLabel}>Multimedia</ThemedText>
      <View style={styles.mediaGrid}>
        {mediaList.map((media, i) => {
          const url = getMediaUrl(media);
          const isVideo = media.mimetype.startsWith('video/');

          return (
            <View key={i} style={styles.mediaItem}>
              {isVideo ? (
                <ThemedView type="backgroundElement" style={styles.videoCard}>
                  <ThemedText style={styles.videoEmoji}>🎬</ThemedText>
                  <ThemedText type="small" numberOfLines={1} style={styles.mediaFileName}>
                    {media.originalname}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {(media.size / 1024 / 1024).toFixed(1)} MB
                  </ThemedText>
                </ThemedView>
              ) : (
                <Image source={{ uri: url }} style={styles.mediaImage} contentFit="cover" />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

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

          {item.multimedia.length > 0 && !firstImage && (
            <ThemedView type="backgroundElement" style={styles.heroVideo}>
              <ThemedText style={{ fontSize: 64 }}>🎬</ThemedText>
            </ThemedView>
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
              {(() => {
                let finalPrice = item.precio;
                if (item.tipoOferta === 'percentage') {
                  finalPrice = item.precio * (1 - item.descuento / 100);
                } else {
                  finalPrice = item.precio - item.descuento;
                }
                if (finalPrice < 0) finalPrice = 0;
                return (
                  <ThemedText style={styles.finalPrice}>
                    ${finalPrice.toFixed(2)}
                  </ThemedText>
                );
              })()}
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  heroVideo: {
    width: '100%',
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  itemName: {
    fontSize: 24,
    lineHeight: 30,
  },
  itemDesc: {
    fontSize: 15,
    lineHeight: 22,
  },
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
  infoValue: {
    fontSize: 16,
  },
  priceCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 4,
  },
  finalPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#208AEF',
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
  dateItem: {
    gap: 2,
  },
  mediaSection: {
    gap: Spacing.two,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  mediaItem: {
    width: '48%',
  },
  mediaImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.two,
  },
  videoCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  videoEmoji: {
    fontSize: 36,
  },
  mediaFileName: {
    fontSize: 11,
    paddingHorizontal: Spacing.two,
  },
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
