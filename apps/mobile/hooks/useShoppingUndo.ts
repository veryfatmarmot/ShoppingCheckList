import { listRepository } from '@shopping-check-list/data';
import type { ListItem } from '@shopping-check-list/domain';
import { randomUUID } from 'expo-crypto';
import { useCallback, useEffect, useRef, useState } from 'react';

const UNDO_BUFFER_SIZE = 10;
const SNACKBAR_DURATION_MS = 5000;

export interface ShoppingUndo {
  // Top of the undo buffer while the snackbar is showing (null when hidden).
  pending: ListItem | null;
  // How many buffered deletions can still be undone.
  remaining: number;
  markBought: (item: ListItem) => Promise<void>;
  undo: () => Promise<void>;
}

// Local-only undo for "mark bought" (M5-T3/T4). Keeps the last N deleted list
// items in memory (most recent first). Undo pops the buffer LIFO — tapping it
// repeatedly restores the most recent deletions first, each recreated under a
// NEW id (per sync-rules). Not synchronized across devices.
export function useShoppingUndo(userId: string | undefined): ShoppingUndo {
  const bufferRef = useRef<ListItem[]>([]);
  const [top, setTop] = useState<ListItem | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showFor = useCallback(
    (durationMs: number) => {
      clearTimer();
      setVisible(true);
      timerRef.current = setTimeout(() => setVisible(false), durationMs);
    },
    [clearTimer],
  );

  // Mirror the buffer ref into render state (top item + count).
  const syncBuffer = useCallback(() => {
    setTop(bufferRef.current[0] ?? null);
    setRemaining(bufferRef.current.length);
  }, []);

  const markBought = useCallback(
    async (item: ListItem) => {
      if (!userId) {
        return;
      }
      bufferRef.current = [item, ...bufferRef.current].slice(
        0,
        UNDO_BUFFER_SIZE,
      );
      syncBuffer();
      showFor(SNACKBAR_DURATION_MS);
      await listRepository.delete(userId, item.id);
    },
    [userId, syncBuffer, showFor],
  );

  const undo = useCallback(async () => {
    const item = bufferRef.current[0];
    if (!userId || !item) {
      setVisible(false);
      clearTimer();
      return;
    }
    bufferRef.current = bufferRef.current.slice(1);
    syncBuffer();
    if (bufferRef.current.length > 0) {
      // Keep the snackbar up so the next-most-recent can be undone too.
      showFor(SNACKBAR_DURATION_MS);
    } else {
      setVisible(false);
      clearTimer();
    }
    const now = Date.now();
    // Recreate under a new id; keep the snapshot, quantity and catalog link.
    await listRepository.set(userId, {
      ...item,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }, [userId, syncBuffer, showFor, clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  return { pending: visible ? top : null, remaining, markBought, undo };
}
