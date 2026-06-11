import { randomUUID } from 'node:crypto';

import type { Item } from '../types/item.js';

const items: Item[] = [];

export function listItems() {
  return items;
}

export function createStoredItem(item: Omit<Item, 'id' | 'createdAt'>) {
  const record: Item = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...item,
  };

  items.unshift(record);

  return record;
}