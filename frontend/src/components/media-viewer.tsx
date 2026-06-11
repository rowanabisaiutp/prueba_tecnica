import { Image } from 'expo-image';
import type { VideoThumbnail } from 'expo-video';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { ItemMedia } from '@/types/item';
import { getMediaUrl, generateVideoThumbnail } from '@/utils/media';

export function MediaViewer({ mediaList }: { mediaList: ItemMedia[] }) {
  const [thumbnails, setThumbnails] = useState<Record<number, VideoThumbnail | null>>({});
  const theme = useTheme();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      for (let i = 0; i < mediaList.length; i++) {
        if (cancelled) break;
        const media = mediaList[i];
        if (media.mimetype.startsWith('video/')) {
          try {
            const url = getMediaUrl(media);
            const thumb = await generateVideoThumbnail(url);
            if (!cancelled && thumb) setThumbnails((prev) => ({ ...prev, [i]: thumb }));
          } catch {}
        }
      }
    })();

    return () => { cancelled = true; };
  }, [mediaList]);

  return (
    <View style={styles.mediaSection}>
      <ThemedText type="smallBold" style={styles.sectionLabel}>Multimedia</ThemedText>
      <View style={styles.mediaGrid}>
        {mediaList.map((media, i) => {
          const url = getMediaUrl(media);
          const isVideo = media.mimetype.startsWith('video/');
          const thumb = thumbnails[i];

          return (
            <View key={i} style={styles.mediaItem}>
              {isVideo ? (
    thumb ? (
      <Image source={thumb} style={styles.mediaImage} contentFit="cover" />
    ) : (
                  <ThemedView type="backgroundElement" style={styles.videoCard}>
                    <ThemedText style={styles.videoEmoji}>🎬</ThemedText>
                    <ThemedText type="small" numberOfLines={1} style={styles.mediaFileName}>
                      {media.originalname}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {(media.size / 1024 / 1024).toFixed(1)} MB
                    </ThemedText>
                  </ThemedView>
                )
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

const styles = StyleSheet.create({
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
  sectionLabel: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
