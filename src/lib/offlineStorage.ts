/**
 * Mode hors ligne léger pour S-reptrack.
 * Cache les données critiques dans localStorage/IndexedDB
 * et synchronise automatiquement au retour en ligne.
 */

const DB_NAME = "sreptrack-offline";
const DB_VERSION = 1;
const STORES = ["reptiles", "feedings", "pending_actions"] as const;

type StoreName = typeof STORES[number];

// ============ IndexedDB helpers ============

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      }
    };
  });
}

async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putAll<T extends { id: string }>(store: StoreName, items: T[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(store, "readwrite");
  const objectStore = tx.objectStore(store);
  for (const item of items) {
    objectStore.put(item);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function putOne<T extends { id: string }>(store: StoreName, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteOne(store: StoreName, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function clearStore(store: StoreName): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ============ Offline cache API ============

export interface PendingAction {
  id: string;
  table: string;
  operation: "insert" | "update" | "delete";
  data: Record<string, unknown>;
  created_at: string;
}

/**
 * Cache reptiles data locally for offline access.
 */
export async function cacheReptiles(reptiles: { id: string; [key: string]: unknown }[]): Promise<void> {
  try {
    await clearStore("reptiles");
    await putAll("reptiles", reptiles);
    localStorage.setItem("offline-cache-date", new Date().toISOString());
  } catch (e) {
    console.warn("Failed to cache reptiles offline:", e);
  }
}

/**
 * Cache feedings data locally.
 */
export async function cacheFeedings(feedings: { id: string; [key: string]: unknown }[]): Promise<void> {
  try {
    await clearStore("feedings");
    await putAll("feedings", feedings);
  } catch (e) {
    console.warn("Failed to cache feedings offline:", e);
  }
}

/**
 * Get cached reptiles when offline.
 */
export async function getCachedReptiles<T>(): Promise<T[]> {
  try {
    return await getAll<T>("reptiles");
  } catch {
    return [];
  }
}

/**
 * Get cached feedings when offline.
 */
export async function getCachedFeedings<T>(): Promise<T[]> {
  try {
    return await getAll<T>("feedings");
  } catch {
    return [];
  }
}

/**
 * Queue an action for later sync when back online.
 */
export async function queueOfflineAction(action: Omit<PendingAction, "id" | "created_at">): Promise<void> {
  const pending: PendingAction = {
    ...action,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  await putOne("pending_actions", pending);
}

/**
 * Get all pending actions to sync.
 */
export async function getPendingActions(): Promise<PendingAction[]> {
  return getAll<PendingAction>("pending_actions");
}

/**
 * Remove a synced action from the queue.
 */
export async function removePendingAction(id: string): Promise<void> {
  await deleteOne("pending_actions", id);
}

/**
 * Check if we have cached data available.
 */
export function getLastCacheDate(): string | null {
  return localStorage.getItem("offline-cache-date");
}

/**
 * Check if user is currently online.
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Get pending actions count.
 */
export async function getPendingCount(): Promise<number> {
  const actions = await getPendingActions();
  return actions.length;
}
