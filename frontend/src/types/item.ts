import type { VideoThumbnail } from 'expo-video';

export type TipoOferta = 'money' | 'percentage';

export type FilterType = 'all' | TipoOferta;

export type MediaFile = {
  uri: string;
  name: string;
  type: string;
  size: number;
  thumbnail?: VideoThumbnail;
};

export type FieldErrors = Partial<Record<keyof CreateItemPayload | 'multimedia', string>>;

export type ItemMedia = {
  fieldname: string;
  originalname: string;
  mimetype: string;
  filename: string;
  path: string;
  size: number;
};

export type Item = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipoOferta: TipoOferta;
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  multimedia: ItemMedia[];
  createdAt: string;
};

export type CreateItemPayload = {
  nombre: string;
  descripcion: string;
  precio: number;
  tipoOferta: TipoOferta;
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
};

export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_FILE_COUNT = 10;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/3gpp', 'video/x-msvideo'];
export const ALLOWED_MIME_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
