/**
 * Fetch true road turn-by-turn geometry and driving duration from OpenStreetMap OSRM
 */
export interface OsrmRouteResult {
  coordinates: [number, number][]; // [lat, lng] array for Leaflet Polyline
  distanceKm: number;
  durationMinutes: number;
}

export async function fetchRoadRoute(
  startLat: number,
  startLon: number,
  destLat: number,
  destLon: number
): Promise<OsrmRouteResult | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${destLon},${destLat}?overview=full&geometries=geojson`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const best = data.routes[0];
      // Convert OSRM GeoJSON [lon, lat] coordinates to Leaflet [lat, lon]
      const coordinates: [number, number][] = (best.geometry?.coordinates || []).map(
        (c: [number, number]) => [c[1], c[0]]
      );

      return {
        coordinates,
        distanceKm: parseFloat((best.distance / 1000).toFixed(2)),
        durationMinutes: Math.max(1, Math.round(best.duration / 60))
      };
    }
  } catch (err) {
    console.warn("OSRM route fetch fallback to straight line:", err);
  }

  return null;
}
