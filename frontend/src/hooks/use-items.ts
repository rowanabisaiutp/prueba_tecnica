import { useCallback, useEffect, useState } from 'react';

import { getItems } from '@/services/api';
import type { Item } from '@/types/item';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      setError(null);
      const data = await getItems();
      setItems(data);
    } catch (e: any) {
      console.error('Error cargando items:', e?.message);
      setError(e?.message || 'Error al cargar items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return { items, loading, error, refreshing, onRefresh };
}
