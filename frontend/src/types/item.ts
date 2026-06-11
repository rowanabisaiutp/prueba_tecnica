export type TipoOferta = 'money' | 'percentage';

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
