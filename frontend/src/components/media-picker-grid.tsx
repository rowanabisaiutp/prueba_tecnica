import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorRed, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MediaFile } from '@/types/item';

type Props = {
  media: MediaFile[];
  error?: string;
  onPickFromCamera: () => void;
  onPickFromGallery: () => void;
  onRemove: (index: number) => void;
};

export function MediaPickerGrid({ media, error, onPickFromCamera, onPickFromGallery, onRemove }: Props) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.section}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>
        Multimedia
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.mediaHint}>
        Sube imágenes o videos desde la cámara o galería
      </ThemedText>

      <View style={styles.mediaButtons}>
        <TouchableOpacity
          style={[styles.mediaButton, { backgroundColor: theme.background }]}
          onPress={onPickFromCamera}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.mediaButtonEmoji}>📷</ThemedText>
          <ThemedText type="smallBold" style={styles.mediaButtonLabel}>Cámara</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mediaButton, { backgroundColor: theme.background }]}
          onPress={onPickFromGallery}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.mediaButtonEmoji}>🖼️</ThemedText>
          <ThemedText type="smallBold" style={styles.mediaButtonLabel}>Galería</ThemedText>
        </TouchableOpacity>
      </View>
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

      {media.length > 0 && (
        <View style={styles.mediaGrid}>
          {media.map((m, i) => (
            <View key={i} style={styles.mediaPreviewCard}>
        {m.type.startsWith('image') ? (
          <Image source={{ uri: m.uri }} style={styles.mediaThumb} />
        ) : m.thumbnail ? (
          <Image source={m.thumbnail} style={styles.mediaThumb} />
        ) : (
                <View style={[styles.mediaThumb, styles.videoThumb, { backgroundColor: theme.background }]}>
                  <ThemedText style={styles.videoIcon}>🎬</ThemedText>
                </View>
              )}
              <TouchableOpacity style={styles.mediaRemoveBtn} onPress={() => onRemove(i)}>
                <ThemedText style={styles.mediaRemoveBtnText}>✕</ThemedText>
              </TouchableOpacity>
              <ThemedText type="small" numberOfLines={1} style={styles.mediaFileName}>
                {m.name}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 15,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  mediaHint: {
    marginTop: -Spacing.one,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  mediaButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  mediaButtonEmoji: {
    fontSize: 28,
  },
  mediaButtonLabel: {
    fontSize: 13,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  mediaPreviewCard: {
    width: '48%',
    position: 'relative',
  },
  mediaThumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.two,
  },
  videoThumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIcon: {
    fontSize: 32,
  },
  mediaRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ErrorRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaRemoveBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  mediaFileName: {
    marginTop: Spacing.one,
    fontSize: 11,
  },
  errorText: {
    color: ErrorRed,
    fontSize: 12,
  },
});
