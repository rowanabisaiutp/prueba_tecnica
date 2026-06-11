import type { VideoThumbnail } from 'expo-video';

export type TipoOferta = 'money' | 'percentage';

export type FilterType = 'all' | TipoOferta;

export type MediaFile = {
  uri: string;
  name: string;
  type: string;
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
