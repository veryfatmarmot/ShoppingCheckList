import { describe, expect, it } from 'vitest';

import {
  validateCatalogItem,
  validateGroup,
  validateItemData,
  validateListItem,
  validateName,
  validateQuantity,
} from './validation';

describe('validateName', () => {
  it('rejects an empty string', () => {
    expect(validateName('')).toBe('Name is required');
  });

  it('rejects whitespace-only names', () => {
    expect(validateName('   ')).toBe('Name is required');
  });

  it('accepts non-empty trimmed names', () => {
    expect(validateName(' Milk ')).toBeNull();
  });
});

describe('validateQuantity', () => {
  it('rejects zero', () => {
    expect(validateQuantity(0)).toBe('Quantity must be greater than 0');
  });

  it('rejects negative values', () => {
    expect(validateQuantity(-1)).toBe('Quantity must be greater than 0');
  });

  it('accepts positive decimals', () => {
    expect(validateQuantity(0.5)).toBeNull();
  });
});

describe('validateItemData', () => {
  it('returns no errors for valid item data', () => {
    expect(
      validateItemData({
        name: 'Milk',
        normalizedName: 'milk',
        groupId: null,
        note: '',
      }),
    ).toEqual([]);
  });

  it('rejects mismatched normalizedName', () => {
    expect(
      validateItemData({
        name: 'Milk',
        normalizedName: 'Milk',
        groupId: null,
        note: '',
      }),
    ).toContain('normalizedName must match normalized name rules');
  });

  it('rejects non-string notes', () => {
    expect(
      validateItemData({
        name: 'Milk',
        normalizedName: 'milk',
        groupId: null,
        note: 123 as never,
      }),
    ).toContain('note must be a string');
  });
});

describe('validateGroup', () => {
  it('returns no errors for a valid group', () => {
    expect(
      validateGroup({
        id: 'group-1',
        name: 'Produce',
        normalizedName: 'produce',
        order: 1,
        createdAt: 1,
        updatedAt: 1,
      }),
    ).toEqual([]);
  });

  it('rejects invalid group fields', () => {
    expect(
      validateGroup({
        id: '',
        name: '   ',
        normalizedName: 'wrong',
        order: '1' as never,
        createdAt: '1' as never,
        updatedAt: '1' as never,
      }),
    ).toEqual([
      'id must be a non-empty string',
      'Name is required',
      'normalizedName must match normalized name rules',
      'order must be a number',
      'createdAt must be a number',
      'updatedAt must be a number',
    ]);
  });
});

describe('validateCatalogItem', () => {
  it('returns no errors for a valid catalog item', () => {
    expect(
      validateCatalogItem({
        id: 'catalog-1',
        createdAt: 1,
        updatedAt: 1,
        deleted: false,
        itemData: {
          name: 'Milk',
          normalizedName: 'milk',
          groupId: null,
          note: '',
        },
      }),
    ).toEqual([]);
  });

  it('includes nested item data errors', () => {
    expect(
      validateCatalogItem({
        id: '',
        createdAt: '1' as never,
        updatedAt: '1' as never,
        deleted: 'false' as never,
        itemData: {
          name: '   ',
          normalizedName: 'wrong',
          groupId: 10 as never,
          note: 5 as never,
        },
      }),
    ).toEqual([
      'id must be a non-empty string',
      'createdAt must be a number',
      'updatedAt must be a number',
      'deleted must be a boolean',
      'Name is required',
      'normalizedName must match normalized name rules',
      'groupId must be a string or null',
      'note must be a string',
    ]);
  });
});

describe('validateListItem', () => {
  it('returns no errors for a valid list item', () => {
    expect(
      validateListItem({
        id: 'list-1',
        catalogItemId: null,
        quantity: 2,
        createdAt: 1,
        updatedAt: 1,
        itemData: {
          name: 'Milk',
          normalizedName: 'milk',
          groupId: null,
          note: '',
        },
      }),
    ).toEqual([]);
  });

  it('includes quantity and nested item data errors', () => {
    expect(
      validateListItem({
        id: '',
        catalogItemId: 5 as never,
        quantity: 0,
        createdAt: '1' as never,
        updatedAt: '1' as never,
        itemData: {
          name: '   ',
          normalizedName: 'wrong',
          groupId: 10 as never,
          note: 5 as never,
        },
      }),
    ).toEqual([
      'id must be a non-empty string',
      'catalogItemId must be a string or null',
      'Quantity must be greater than 0',
      'createdAt must be a number',
      'updatedAt must be a number',
      'Name is required',
      'normalizedName must match normalized name rules',
      'groupId must be a string or null',
      'note must be a string',
    ]);
  });
});
