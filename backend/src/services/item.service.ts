import { createItemRecord, listItems as listItemRecords } from '../repositories/item.repository.js';
import type { ItemMedia, TipoOferta } from '../types/item.js';
import type { CreateItemInput } from '../validators/item.schema.js';

function mapFiles(files: Express.Multer.File[]): ItemMedia[] {
  return files.map((file) => ({
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    filename: file.filename,
    path: file.path,
    size: file.size,
  }));
}

function mapDiscount(tipoOferta: TipoOferta, descuento: number) {
  return tipoOferta === 'percentage' ? descuento : Math.round(descuento * 100) / 100;
}

export function getItems() {
  return listItemRecords();
}

export async function createItem(payload: Omit<CreateItemInput, 'multimedia'>, files: Express.Multer.File[]) {
  return createItemRecord({
    nombre: payload.nombre,
    descripcion: payload.descripcion,
    precio: payload.precio,
    tipoOferta: payload.tipoOferta,
    descuento: mapDiscount(payload.tipoOferta, payload.descuento),
    fechaInicio: new Date(payload.fechaInicio).toISOString(),
    fechaFin: new Date(payload.fechaFin).toISOString(),
    multimedia: mapFiles(files),
  });
}