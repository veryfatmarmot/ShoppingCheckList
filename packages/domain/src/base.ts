export type EntityId = string;
export type UnixEpochMs = number;

export interface TimestampedEntity {
  id: EntityId;
  createdAt: UnixEpochMs;
  updatedAt: UnixEpochMs;
}
