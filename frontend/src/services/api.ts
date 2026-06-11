import axios from 'axios';

import type { CreateItemPayload, Item } from '@/types/item';

export const API_BASE = 'http://192.168.2.115:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export async function getItems(): Promise<Item[]> {
  const res = await api.get<{ items: Item[] }>('/items');
  return res.data.items;
}

export async function createItem(
  payload: CreateItemPayload,
  mediaUris: { uri: string; name: string; type: string }[],
): Promise<Item> {
  const formData = new FormData();

  formData.append('nombre', payload.nombre);
  formData.append('descripcion', payload.descripcion);
  formData.append('precio', String(payload.precio));
  formData.append('tipoOferta', payload.tipoOferta);
  formData.append('descuento', String(payload.descuento));
  formData.append('fechaInicio', payload.fechaInicio);
  formData.append('fechaFin', payload.fechaFin);

  mediaUris.forEach((media) => {
    const file = {
      uri: media.uri,
      name: media.name,
      type: media.type,
    } as unknown as Blob;
    formData.append('multimedia', file);
  });

  const res = await api.post<{ message: string; item: Item }>('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.item;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await api.get('/health');
    return res.data.ok === true;
  } catch {
    return false;
  }
}
