import { randomUUID } from 'node:crypto';

import type { Item, ItemMedia, TipoOferta } from '../types/item.js';
import { pool } from '../db/pool.js';

type ItemRow = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  tipo_oferta: TipoOferta;
  descuento: string;
  fecha_inicio: string;
  fecha_fin: string;
  multimedia: ItemMedia[];
  created_at: string;
};

function mapRow(row: ItemRow): Item {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    precio: Number(row.precio),
    tipoOferta: row.tipo_oferta,
    descuento: Number(row.descuento),
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin,
    multimedia: row.multimedia ?? [],
    createdAt: row.created_at,
  };
}

export async function listItems() {
  const result = await pool.query<ItemRow>('SELECT * FROM items ORDER BY created_at DESC');

  return result.rows.map(mapRow);
}

export async function createItemRecord(item: Omit<Item, 'id' | 'createdAt'>) {
  const id = randomUUID();

  const result = await pool.query<ItemRow>(
    `
      INSERT INTO items (
        id,
        nombre,
        descripcion,
        precio,
        tipo_oferta,
        descuento,
        fecha_inicio,
        fecha_fin,
        multimedia
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
    [
      id,
      item.nombre,
      item.descripcion,
      item.precio,
      item.tipoOferta,
      item.descuento,
      item.fechaInicio,
      item.fechaFin,
      JSON.stringify(item.multimedia),
    ],
  );

  return mapRow(result.rows[0]);
}