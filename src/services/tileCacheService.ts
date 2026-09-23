/**
 * IndexedDB-based Map Tile Cache Service for Offline Leaflet Navigation
 * Caches raster tile blobs locally in browser IndexedDB with TTL and count limits.
 */

const DB_NAME = 'surokkha_tile_cache_db';
const STORE_NAME = 'tiles';
const DB_VERSION = 1;
const MAX_TILES_CACHE = 1500; // Keep reasonable storage footprint (~20-30MB max)

interface CachedTileRecord {
  url: string;
  blob: Blob;
  mimeType: string;
  timestamp: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
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
 * Retrieve cached tile Blob from IndexedDB
 */
export async function getCachedTile(url: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(url);

      req.onsuccess = () => {
        const record = req.result as CachedTileRecord | undefined;
        if (record && record.blob) {
          resolve(record.blob);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('TileCache: Failed reading from IndexedDB', err);
    return null;
  }
}

/**
 * Store a downloaded tile blob in IndexedDB
 */
export async function saveCachedTile(url: string, blob: Blob): Promise<void> {
  try {
    const db = await getDB();
    const record: CachedTileRecord = {
      url,
      blob,
      mimeType: blob.type || 'image/png',
      timestamp: Date.now(),
    };

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(record);

      tx.oncomplete = () => {
        resolve();
      };
      tx.onerror = () => {
        resolve(); // silent recover on quota or tx fail
      };
    });
  } catch (err) {
    console.warn('TileCache: Failed storing tile in IndexedDB', err);
  }
}

/**
 * Prune old tiles if cache exceeds threshold to respect device memory
 */
export async function pruneTileCache(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const countReq = store.count();

    countReq.onsuccess = () => {
      const count = countReq.result;
      if (count > MAX_TILES_CACHE) {
        const deleteCount = count - (MAX_TILES_CACHE - 200);
        const index = store.index('timestamp');
        const cursorReq = index.openCursor();
        let deleted = 0;

        cursorReq.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest).result as IDBCursorWithValue | null;
          if (cursor && deleted < deleteCount) {
            cursor.delete();
            deleted++;
            cursor.continue();
          }
        };
      }
    };
  } catch (e) {
    // ignore pruning failure
  }
}

/**
 * Get total number of cached tiles and approximate memory size
 */
export async function getTileCacheStats(): Promise<{ count: number; approxMb: number }> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const countReq = store.count();

      countReq.onsuccess = () => {
        const count = countReq.result;
        // Average tile is ~20KB
        const approxMb = parseFloat(((count * 20) / 1024).toFixed(1));
        resolve({ count, approxMb });
      };
      countReq.onerror = () => {
        resolve({ count: 0, approxMb: 0 });
      };
    });
  } catch {
    return { count: 0, approxMb: 0 };
  }
}

/**
 * Pre-cache tiles around a specific lat/lon and zoom range
 * Converts lat/lon to slippy map tile coordinates (x, y, z)
 */
function lon2tile(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function lat2tile(lat: number, zoom: number): number {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
}

export async function prefetchAreaTiles(
  lat: number,
  lon: number,
  radiusKm: number,
  onProgress?: (cached: number, total: number) => void
): Promise<{ total: number; saved: number }> {
  const zoomLevels = [12, 13, 14]; // practical emergency zoom levels
  const tileUrls: string[] = [];

  // Approximate lat/lon delta for radiusKm
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLon = lon - lonDelta;
  const maxLon = lon + lonDelta;

  for (const z of zoomLevels) {
    const minX = lon2tile(minLon, z);
    const maxX = lon2tile(maxLon, z);
    const minY = lat2tile(maxLat, z);
    const maxY = lat2tile(minLat, z);

    for (let x = Math.min(minX, maxX); x <= Math.max(minX, maxX); x++) {
      for (let y = Math.min(minY, maxY); y <= Math.max(minY, maxY); y++) {
        // OpenStreetMap standard tile URL
        const subdomains = ['a', 'b', 'c'];
        const s = subdomains[(x + y) % subdomains.length];
        const url = `https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
        tileUrls.push(url);
      }
    }
  }

  // Deduplicate and cap at reasonable download amount
  const uniqueUrls = Array.from(new Set(tileUrls)).slice(0, 150);
  let saved = 0;

  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i];
    try {
      const existing = await getCachedTile(url);
      if (!existing) {
        const res = await fetch(url, { mode: 'cors' });
        if (res.ok) {
          const blob = await res.blob();
          await saveCachedTile(url, blob);
          saved++;
        }
      } else {
        saved++;
      }
    } catch {
      // Continue to next tile on error
    }
    if (onProgress) {
      onProgress(i + 1, uniqueUrls.length);
    }
  }

  return { total: uniqueUrls.length, saved };
}

/**
 * Clear all cached tiles
 */
export async function clearTileCache(): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}
