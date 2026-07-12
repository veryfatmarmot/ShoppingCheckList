import type { CatalogItem } from './catalogItem';
import type { Group } from './group';
import type { ItemData } from './itemData';
import type { ListItem } from './listItem';
import { normalizeName } from './normalizeName';

export function validateName(name: string): string | null {
  return name.trim().length > 0 ? null : 'Name is required';
}

export function validateQuantity(quantity: number): string | null {
  return quantity > 0 ? null : 'Quantity must be greater than 0';
}

export function validateItemData(itemData: ItemData): string[] {
  const errors: string[] = [];

  const nameError = validateName(itemData.name);
  if (nameError) {
    errors.push(nameError);
  }

  if (itemData.normalizedName !== normalizeName(itemData.name)) {
    errors.push('normalizedName must match normalized name rules');
  }

  if (itemData.groupId !== null && typeof itemData.groupId !== 'string') {
    errors.push('groupId must be a string or null');
  }

  if (typeof itemData.note !== 'string') {
    errors.push('note must be a string');
  }

  return errors;
}

export function validateGroup(group: Group): string[] {
  const errors: string[] = [];

  if (typeof group.id !== 'string' || group.id.length === 0) {
    errors.push('id must be a non-empty string');
  }

  const nameError = validateName(group.name);
  if (nameError) {
    errors.push(nameError);
  }

  if (group.normalizedName !== normalizeName(group.name)) {
    errors.push('normalizedName must match normalized name rules');
  }

  if (typeof group.order !== 'number') {
    errors.push('order must be a number');
  }

  if (typeof group.createdAt !== 'number') {
    errors.push('createdAt must be a number');
  }

  if (typeof group.updatedAt !== 'number') {
    errors.push('updatedAt must be a number');
  }

  return errors;
}

export function validateCatalogItem(catalogItem: CatalogItem): string[] {
  const errors: string[] = [];

  if (typeof catalogItem.id !== 'string' || catalogItem.id.length === 0) {
    errors.push('id must be a non-empty string');
  }

  if (typeof catalogItem.createdAt !== 'number') {
    errors.push('createdAt must be a number');
  }

  if (typeof catalogItem.updatedAt !== 'number') {
    errors.push('updatedAt must be a number');
  }

  if (typeof catalogItem.deleted !== 'boolean') {
    errors.push('deleted must be a boolean');
  }

  return [...errors, ...validateItemData(catalogItem.itemData)];
}

export function validateListItem(listItem: ListItem): string[] {
  const errors: string[] = [];

  if (typeof listItem.id !== 'string' || listItem.id.length === 0) {
    errors.push('id must be a non-empty string');
  }

  if (
    listItem.catalogItemId !== null &&
    typeof listItem.catalogItemId !== 'string'
  ) {
    errors.push('catalogItemId must be a string or null');
  }

  const quantityError = validateQuantity(listItem.quantity);
  if (quantityError) {
    errors.push(quantityError);
  }

  if (typeof listItem.createdAt !== 'number') {
    errors.push('createdAt must be a number');
  }

  if (typeof listItem.updatedAt !== 'number') {
    errors.push('updatedAt must be a number');
  }

  return [...errors, ...validateItemData(listItem.itemData)];
}
