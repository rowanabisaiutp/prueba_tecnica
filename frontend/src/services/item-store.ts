import type { Item } from '@/types/item';

let _selectedItem: Item | null = null;

export function setSelectedItem(item: Item) {
  _selectedItem = item;
}

export function getSelectedItem(): Item | null {
  return _selectedItem;
}

export function clearSelectedItem() {
  _selectedItem = null;
}
