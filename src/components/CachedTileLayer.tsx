import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { getCachedTileBlobUrl, saveTileBlob } from '../utils/mapTileCache';

interface CachedTileLayerProps {
  url: string;
  attribution: string;
  mapStyleKey: string;
  onTileCached?: () => void;
}

// Custom Leaflet TileLayer that checks IndexedDB before fetching over network
const OfflineCachedTileLayerClass = L.TileLayer.extend({
  createTile(coords: L.Coords, done: L.DoneCallback) {
    const tile = document.createElement('img');

    L.DomEvent.on(tile, 'load', L.Util.bind((this as any)._tileOnLoad, this, done, tile));
    L.DomEvent.on(tile, 'error', L.Util.bind((this as any)._tileOnError, this, done, tile));

    if ((this as any).options.crossOrigin || (this as any).options.crossOrigin === '') {
      tile.crossOrigin = (this as any).options.crossOrigin === true ? '' : (this as any).options.crossOrigin;
    }

    tile.alt = '';
    tile.setAttribute('role', 'presentation');

    const originalUrl = (this as any).getTileUrl(coords);
    const tileKey = `${(this as any).options.mapStyleKey}_${coords.z}_${coords.x}_${coords.y}`;

    // 1. Try to load from IndexedDB cache first
    getCachedTileBlobUrl(tileKey).then((cachedBlobUrl) => {
      if (cachedBlobUrl) {
        tile.src = cachedBlobUrl;
        return;
      }

      // 2. If not in cache and browser is online, fetch and store
      if (navigator.onLine) {
        fetch(originalUrl, { mode: 'cors' })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Tile fetch error: ${response.status}`);
            }
            return response.blob();
          })
          .then((blob) => {
            // Save blob into IndexedDB
            saveTileBlob(tileKey, blob);
            if ((this as any).options.onTileCached) {
              (this as any).options.onTileCached();
            }

            // Use blob url for display
            const blobUrl = URL.createObjectURL(blob);
            tile.src = blobUrl;
          })
          .catch(() => {
            // If CORS or network fetch error, fallback to direct src
            tile.src = originalUrl;
          });
      } else {
        // If offline and not in IndexedDB, generate an emergency grid SVG tile
        const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="%23f1f5f9"/><path d="M0 0h256v256H0z" fill="none" stroke="%23cbd5e1" stroke-width="1"/><text x="128" y="128" font-family="sans-serif" font-size="10" fill="%2394a3b8" text-anchor="middle" dominant-baseline="middle">OFFLINE MAP GRID</text></svg>`;
        tile.src = fallbackSvg;
      }
    }).catch(() => {
      tile.src = originalUrl;
    });

    return tile;
  }
});

export const CachedTileLayer: React.FC<CachedTileLayerProps> = ({
  url,
  attribution,
  mapStyleKey,
  onTileCached
}) => {
  const map = useMap();

  useEffect(() => {
    const layer = new (OfflineCachedTileLayerClass as any)(url, {
      attribution,
      mapStyleKey,
      onTileCached,
      crossOrigin: true,
      maxZoom: 19
    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, url, attribution, mapStyleKey, onTileCached]);

  return null;
};
