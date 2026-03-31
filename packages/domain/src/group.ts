import type { TimestampedEntity } from './base';

export interface Group extends TimestampedEntity {
  name: string;
  normalizedName: string;
  order: number;
}
