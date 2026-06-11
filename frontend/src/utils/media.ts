import type { VideoThumbnail } from 'expo-video';
import { createVideoPlayer } from 'expo-video';

import type { Item, ItemMedia } from '@/types/item';
import { API_BASE } from '@/services/api';

export function getMediaUrl(media: ItemMedia): string {
  const filename = media.filename || media.path?.split('/').pop();
  if (!filename) return '';
  return `${API_BASE.replace('/api', '')}/uploads/${filename}`;
}

export function calculateFinalPrice(item: Item): number {
  let finalPrice = item.precio;
  if (item.tipoOferta === 'percentage') {
    finalPrice = item.precio * (1 - item.descuento / 100);
  } else {
    finalPrice = item.precio - item.descuento;
  }
  return Math.max(finalPrice, 0);
}

export async function generateVideoThumbnail(uri: string): Promise<VideoThumbnail | null> {
  const player = createVideoPlayer(uri);
  try {
    const thumbnails = await player.generateThumbnailsAsync([0]);
    return thumbnails[0] ?? null;
  } catch {
    return null;
  } finally {
    player.release();
  }
}
