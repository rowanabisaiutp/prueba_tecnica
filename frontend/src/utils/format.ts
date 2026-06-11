import type { Item } from '@/types/item';

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDiscount(item: Item) {
  return item.tipoOferta === 'percentage'
    ? `${item.descuento}%`
    : `$${item.descuento.toFixed(2)}`;
}
