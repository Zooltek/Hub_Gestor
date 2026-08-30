import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import { toast } from "sonner";

export interface ConcurrencyLock {
  resourceType: "order" | "batch" | "catalog_item" | "settings";
  resourceId: string;
  lockedBy: {
    userId: string;
    username: string;
    displayName: string;
  };
  lockedAt: string;
  expiresAt: string;
}

const STORAGE_LOCKS_KEY = "hub_gerencial_active_locks";
const HEARTBEAT_INTERVAL_MS = 15000;
const LEASE_DURATION_MS = 60000; // 1 minuto de lease renovado

export function useConcurrencyLock(
  resourceType: "order" | "batch" | "catalog_item" | "settings",
  resourceId: string | null | undefined,
  isEditing: boolean = false
) {
  const { user } = useAuth();
  const [activeLock, setActiveLock] = useState<ConcurrencyLock | null>(null);
  const [isLockedByMe, setIsLockedByMe] = useState<boolean>(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const getStoredLocks = useCallback((): Record<string, ConcurrencyLock> => {
    try {
      const stored = localStorage.getItem(STORAGE_LOCKS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const setStoredLocks = useCallback((locks: Record<string, ConcurrencyLock>) => {
    try {
      localStorage.setItem(STORAGE_LOCKS_KEY, JSON.stringify(locks));
    } catch {
      // ignore
    }
  }, []);

  const checkLock = useCallback(() => {
    if (!resourceId) {
      setActiveLock(null);
      setIsLockedByMe(false);
      return;
    }

    const lockKey = `${resourceType}:${resourceId}`;
    const allLocks = getStoredLocks();
    const existing = allLocks[lockKey];

    if (existing) {
      const isExpired = new Date(existing.expiresAt).getTime() < Date.now();
      if (isExpired) {
        delete allLocks[lockKey];
        setStoredLocks(allLocks);
        setActiveLock(null);
        setIsLockedByMe(false);
      } else {
        setActiveLock(existing);
        setIsLockedByMe(existing.lockedBy.userId === user?.id);
      }
    } else {
      setActiveLock(null);
      setIsLockedByMe(false);
    }
  }, [resourceType, resourceId, user?.id, getStoredLocks, setStoredLocks]);

  // Acquire or refresh lock
  const acquireLock = useCallback((): boolean => {
    if (!resourceId || !user) return false;

    const lockKey = `${resourceType}:${resourceId}`;
    const allLocks = getStoredLocks();
    const existing = allLocks[lockKey];

    if (existing && existing.lockedBy.userId !== user.id) {
      const isExpired = new Date(existing.expiresAt).getTime() < Date.now();
      if (!isExpired) {
        setActiveLock(existing);
        setIsLockedByMe(false);
        toast.warning(`Atenção: Este item está em edição por ${existing.lockedBy.displayName}.`);
        return false;
      }
    }

    const now = new Date();
    const newLock: ConcurrencyLock = {
      resourceType,
      resourceId,
      lockedBy: {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
      },
      lockedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + LEASE_DURATION_MS).toISOString(),
    };

    allLocks[lockKey] = newLock;
    setStoredLocks(allLocks);
    setActiveLock(newLock);
    setIsLockedByMe(true);

    channelRef.current?.postMessage({
      type: "LOCK_ACQUIRED",
      lock: newLock,
    });

    return true;
  }, [resourceType, resourceId, user, getStoredLocks, setStoredLocks]);

  // Release lock
  const releaseLock = useCallback(() => {
    if (!resourceId || !user) return;

    const lockKey = `${resourceType}:${resourceId}`;
    const allLocks = getStoredLocks();
    const existing = allLocks[lockKey];

    if (existing && existing.lockedBy.userId === user.id) {
      delete allLocks[lockKey];
      setStoredLocks(allLocks);
      setActiveLock(null);
      setIsLockedByMe(false);

      channelRef.current?.postMessage({
        type: "LOCK_RELEASED",
        lockKey,
      });
    }
  }, [resourceType, resourceId, user, getStoredLocks, setStoredLocks]);

  useEffect(() => {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("hub_concurrency_locks");
      channelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data.type === "LOCK_ACQUIRED" || event.data.type === "LOCK_RELEASED") {
          checkLock();
        }
      };

      return () => {
        channel.close();
      };
    }
  }, [checkLock]);

  useEffect(() => {
    checkLock();
  }, [resourceId, checkLock]);

  useEffect(() => {
    if (isEditing && resourceId) {
      acquireLock();
      const interval = setInterval(() => {
        acquireLock();
      }, HEARTBEAT_INTERVAL_MS);

      return () => {
        clearInterval(interval);
        releaseLock();
      };
    }
  }, [isEditing, resourceId, acquireLock, releaseLock]);

  return {
    activeLock,
    isLockedByMe,
    isLockedByOther: Boolean(activeLock && !isLockedByMe),
    acquireLock,
    releaseLock,
    checkLock,
  };
}
