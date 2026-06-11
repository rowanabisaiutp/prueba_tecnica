import type { Item, FilterType } from '@/types/item';

export function filterItems(items: Item[], search: string, filter: FilterType): Item[] {
  return items.filter((item) => {
    const matchesSearch =
      !search.trim() ||
      item.nombre.toLowerCase().includes(search.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'all' || item.tipoOferta === filter;

    return matchesSearch && matchesFilter;
  });
}

export const filterOptions: { label: string; value: FilterType }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Dinero', value: 'money' },
  { label: 'Porcentaje', value: 'percentage' },
];
