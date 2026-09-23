/**
 * IndexedDB Map Tile Cache Layer
 * Provides robust offline map capabilities by caching Leaflet map tiles into browser IndexedDB.
 */

const DB_NAME = 'surokkha_map_tiles_db';
const DB_VERSION = 1;
const STORE_NAME = 'map_tiles';
const MAX_CACHED_TILES = 1200; // Limit max tiles to avoid exceeding browser storage quotas (~30MB)

interface CachedTileRecord {
  key: string; // "style/z/x/y"
  blob: Blob;
  timestamp: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Retrieve a cached tile as an Object URL
 */
export async function getCachedTileBlobUrl(key: string): Promise<string | null> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        const record = req.result as CachedTileRecord | undefined;
        if (record && record.blob) {
          const url = URL.createObjectURL(record.blob);
          resolve(url);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    return null;
  }
}

/**
 * Save a fetched tile blob to IndexedDB
 */
export async function saveTileBlob(key: string, blob: Blob): Promise<void> {
  try {
    const db = await getDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record: CachedTileRecord = {
      key,
      blob,
      timestamp: Date.now()
    };

    store.put(record);

    transaction.oncomplete = () => {
      // Periodic pruning if quota approaches limit
      pruneOldTilesIfNeeded(db);
    };
  } catch (err) {
    // Non-critical, ignore storage exceptions
  }
}

/**
 * Prune oldest tiles if total count exceeds MAX_CACHED_TILES
 */
async function pruneOldTilesIfNeeded(db: IDBDatabase): Promise<void> {
  try {
    const countTx = db.transaction(STORE_NAME, 'readonly');
    const countStore = countTx.objectStore(STORE_NAME);
    const countReq = countStore.count();

    countReq.onsuccess = () => {
      const count = countReq.result;
      if (count > MAX_CACHED_TILES) {
        const deleteTx = db.transaction(STORE_NAME, 'readwrite');
        const store = deleteTx.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const cursorReq = index.openCursor(); // Oldest first
        let deleted = 0;
        const targetToDelete = count - MAX_CACHED_TILES + 100;

        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (cursor && deleted < targetToDelete) {
            cursor.delete();
            deleted++;
            cursor.continue();
          }
        };
      }
    };
  } catch {
    // Ignore pruning errors
  }
}

/**
 * Get total number of cached map tiles
 */
export async function getCachedTileCount(): Promise<number> {
  try {
    const db = await getDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}

/**
 * Clear all cached map tiles
 */
export async function clearMapTileCache(): Promise<void> {
  try {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to clear tile cache:', err);
  }
}
