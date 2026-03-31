import type { TimestampedEntity } from './base';
import type { ItemData } from './itemData';

export interface ListItem extends TimestampedEntity {
  catalogItemId: string | null;
  quantity: number;
  itemData: ItemData;
}
