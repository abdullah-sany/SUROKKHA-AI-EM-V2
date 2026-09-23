import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { getCachedTile, saveCachedTile, pruneTileCache } from '../services/tileCacheService';

interface OfflineCachedTileLayerOptions extends L.TileLayerOptions {
  onTileCached?: () => void;
}

interface OfflineCachedTileLayerProps extends OfflineCachedTileLayerOptions {
  url: string;
  attribution?: string;
  maxZoom?: number;
}

/**
 * Custom Leaflet TileLayer that checks IndexedDB before network fetch.
 * When online, it fetches the tile, saves it into IndexedDB, and renders.
 * When offline, it serves directly from IndexedDB without failing or displaying blank broken squares.
 */
class OfflineCachedGridLayer extends L.TileLayer {
  private _onTileCached?: () => void;

  constructor(urlTemplate: string, options?: OfflineCachedTileLayerOptions) {
    super(urlTemplate, options);
    this._onTileCached = options?.onTileCached;
  }

  createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    const tile = document.createElement('img');

    L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
    L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, done, tile));

    if (this.options.crossOrigin || this.options.crossOrigin === '') {
      tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    }

    tile.alt = '';
    tile.setAttribute('role', 'presentation');

    const url = this.getTileUrl(coords);

    // 1. Check IndexedDB first
    getCachedTile(url)
      .then((blob) => {
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          tile.src = blobUrl;
          // Revoke URL object once image loads to avoid memory leak
          const cleanup = () => {
            L.DomEvent.off(tile, 'load', cleanup);
            L.DomEvent.off(tile, 'error', cleanup);
            URL.revokeObjectURL(blobUrl);
          };
          L.DomEvent.on(tile, 'load', cleanup);
          L.DomEvent.on(tile, 'error', cleanup);
          if (this._onTileCached) this._onTileCached();
          return;
        }

        // 2. Not in IndexedDB: fetch from network & save to IndexedDB
        if (navigator.onLine) {
          fetch(url, { mode: 'cors' })
            .then(async (response) => {
              if (!response.ok) {
                throw new Error(`Tile fetch failed with status ${response.status}`);
              }
              const tileBlob = await response.blob();
              // Save to IndexedDB asynchronously
              saveCachedTile(url, tileBlob);
              if (this._onTileCached) this._onTileCached();

              const blobUrl = URL.createObjectURL(tileBlob);
              tile.src = blobUrl;
              const cleanup = () => {
                L.DomEvent.off(tile, 'load', cleanup);
                L.DomEvent.off(tile, 'error', cleanup);
                URL.revokeObjectURL(blobUrl);
              };
              L.DomEvent.on(tile, 'load', cleanup);
              L.DomEvent.on(tile, 'error', cleanup);
            })
            .catch(() => {
              // Direct fallback if fetch or CORS restricted
              tile.src = url;
            });
        } else {
          // Completely offline and not found in cache
          // Supply a lightweight transparent 1x1 fallback tile so Leaflet doesn't crash
          tile.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="12" font-family="sans-serif">Offline</text></svg>';
        }
      })
      .catch(() => {
        tile.src = url;
      });

    return tile;
  }
}

export function OfflineCachedTileLayer({
  url,
  attribution,
  maxZoom = 19,
  onTileCached,
  ...rest
}: OfflineCachedTileLayerProps) {
  const map = useMap();
  const layerRef = useRef<OfflineCachedGridLayer | null>(null);

  useEffect(() => {
    // Periodically prune old tiles
    pruneTileCache();
  }, []);

  useEffect(() => {
    const layer = new OfflineCachedGridLayer(url, {
      attribution,
      maxZoom,
      onTileCached,
      crossOrigin: 'anonymous',
      ...rest,
    });

    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, url, attribution, maxZoom]);

  return null;
}
