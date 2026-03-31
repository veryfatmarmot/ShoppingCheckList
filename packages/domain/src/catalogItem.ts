import type { TimestampedEntity } from './base';
import type { ItemData } from './itemData';

export interface CatalogItem extends TimestampedEntity {
  deleted: boolean;
  itemData: ItemData;
}
