import { HealthcareFacility } from '../types';

interface OverpassElement {
  type: 'node' | 'way';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    'name:bn'?: string;
    'name:en'?: string;
    amenity?: string;
    healthcare?: string;
    phone?: string;
    'contact:phone'?: string;
    'emergency:phone'?: string;
    emergency?: string;
    'addr:street'?: string;
    'addr:city'?: string;
    'addr:suburb'?: string;
    operator?: string;
  };
}

/**
 * Fetch real-time hospitals, clinics, and pharmacies from OpenStreetMap Overpass & Photon & Nominatim engines.
 * Captures all local clinics and hospitals that appear as map icons on the background tile.
 */
export async function fetchLiveOsmHospitals(
  lat: number,
  lon: number,
  radiusMeters: number = 15000
): Promise<HealthcareFacility[]> {
  const aggregatedResults: HealthcareFacility[] = [];
  const seenIds = new Set<string>();
  const seenCoords: Array<{ lat: number; lon: number; name: string }> = [];

  const isNearbyDuplicate = (newLat: number, newLon: number, name: string) => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const c of seenCoords) {
      const dLat = Math.abs(c.lat - newLat);
      const dLon = Math.abs(c.lon - newLon);
      // within ~40 meters
      if (dLat < 0.0004 && dLon < 0.0004) return true;
      // same name within 500 meters
      if (dLat < 0.005 && dLon < 0.005) {
        const existingClean = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (existingClean === cleanName || existingClean.includes(cleanName) || cleanName.includes(existingClean)) {
          return true;
        }
      }
    }
    return false;
  };

  // 1. High-speed, guaranteed engine: Photon Komoot OSM API (Fastest and highly reliable)
  try {
    const queries = ['hospital', 'clinic', 'medical'];
    const photonPromises = queries.map(async (q) => {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${lat}&lon=${lon}&limit=50&osm_tag=amenity:hospital&osm_tag=amenity:clinic&osm_tag=healthcare`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const json = await res.json();
          return json.features || [];
        }
      } catch {
        // continue
      }
      return [];
    });

    const photonFeatures = (await Promise.all(photonPromises)).flat();

    for (const feat of photonFeatures) {
      const props = feat.properties || {};
      const geom = feat.geometry || {};
      const coords = geom.coordinates;
      if (!coords || coords.length < 2) continue;

      const itemLon = coords[0];
      const itemLat = coords[1];
      const rawName = props.name;
      if (!rawName) continue;

      // Filter out non-hospital roads or bus stands if misclassified
      const lower = rawName.toLowerCase();
      if (lower.includes('bus stop') || lower.includes('kacha bazar') || lower.includes('mosque') || lower.endsWith(' road')) {
        continue;
      }

      if (isNearbyDuplicate(itemLat, itemLon, rawName)) continue;

      let facilityType = 'Hospital';
      const osmValue = (props.osm_value || '').toLowerCase();
      if (osmValue.includes('clinic') || lower.includes('clinic')) {
        facilityType = 'Clinic';
      } else if (lower.includes('medical college') || lower.includes('মেডিকেল কলেজ')) {
        facilityType = 'Medical College Hospital';
      } else if (lower.includes('diagnostic') || lower.includes('ডায়াগনস্টিক')) {
        facilityType = 'Diagnostic Center';
      } else if (lower.includes('maternity') || lower.includes('মা ও শিশু')) {
        facilityType = 'Hospital';
      }

      const area = [props.street, props.district || props.suburb || props.city].filter(Boolean).join(', ') || 'Nearby Area';

      seenCoords.push({ lat: itemLat, lon: itemLon, name: rawName });
      aggregatedResults.push({
        id: `osm-ph-${props.osm_id || Math.random().toString(36).substring(7)}`,
        name: rawName,
        nameBn: /[\u0980-\u09FF]/.test(rawName) ? rawName : undefined,
        facilityType,
        division: '',
        district: props.city || '',
        area,
        ownership: 'Public',
        phone: '',
        emergencyPhone: '',
        latitude: itemLat,
        longitude: itemLon,
        verified: true,
        source: 'OpenStreetMap Live',
        lastVerifiedAt: new Date().toISOString()
      });
    }
  } catch (photonErr) {
    console.warn("Photon fetch error:", photonErr);
  }

  // 2. OpenStreetMap Overpass Live Radar (captures all micro nodes, clinics, ways)
  const overpassQuery = `
    [out:json][timeout:10];
    (
      node["amenity"~"hospital|clinic|pharmacy"](around:${radiusMeters},${lat},${lon});
      way["amenity"~"hospital|clinic|pharmacy"](around:${radiusMeters},${lat},${lon});
      node["healthcare"](around:${radiusMeters},${lat},${lon});
      way["healthcare"](around:${radiusMeters},${lat},${lon});
    );
    out center tags 100;
  `;

  const endpoints = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const data = await res.json();
      if (!data || !Array.isArray(data.elements)) continue;

      for (const el of data.elements as OverpassElement[]) {
        const itemLat = el.lat ?? el.center?.lat;
        const itemLon = el.lon ?? el.center?.lon;
        if (!itemLat || !itemLon) continue;

        const tags = el.tags || {};
        const rawName = tags.name || tags['name:en'] || tags['name:bn'];
        if (!rawName) continue; // Skip unnamed nodes

        if (isNearbyDuplicate(itemLat, itemLon, rawName)) continue;

        let facilityType = 'Hospital';
        const amenity = (tags.amenity || tags.healthcare || '').toLowerCase();
        if (amenity.includes('pharmacy')) {
          facilityType = 'Pharmacy';
        } else if (amenity.includes('clinic')) {
          facilityType = 'Clinic';
        } else if (rawName.toLowerCase().includes('medical college') || rawName.includes('মেডিকেল কলেজ')) {
          facilityType = 'Medical College Hospital';
        } else if (rawName.toLowerCase().includes('diagnostic') || rawName.includes('ডায়াগনস্টিক')) {
          facilityType = 'Diagnostic Center';
        }

        const phone = tags.phone || tags['contact:phone'] || '';
        const emergencyPhone = tags['emergency:phone'] || '';
        const area = tags['addr:suburb'] || tags['addr:street'] || tags['addr:city'] || 'Nearby Area';

        seenCoords.push({ lat: itemLat, lon: itemLon, name: rawName });
        aggregatedResults.push({
          id: `osm-${el.type}-${el.id}`,
          name: rawName,
          nameBn: tags['name:bn'] || (tags.name && /[\u0980-\u09FF]/.test(tags.name) ? tags.name : undefined),
          facilityType,
          division: '',
          district: tags['addr:city'] || '',
          area,
          ownership: tags.operator ? 'Private' : 'Public',
          phone,
          emergencyPhone,
          latitude: itemLat,
          longitude: itemLon,
          verified: true,
          source: 'OpenStreetMap Live',
          lastVerifiedAt: new Date().toISOString()
        });
      }

      if (aggregatedResults.length > 0) {
        break; // Successfully loaded from this mirror
      }
    } catch {
      continue;
    }
  }

  // 3. Fallback: OpenStreetMap Nominatim Live Search
  if (aggregatedResults.length < 10) {
    try {
      const deltaDeg = (radiusMeters / 1000) / 111.32;
      const viewbox = `${lon - deltaDeg},${lat + deltaDeg},${lon + deltaDeg},${lat - deltaDeg}`;
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&bounded=1&viewbox=${viewbox}&limit=40`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(nominatimUrl, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const places = await res.json();
        if (Array.isArray(places) && places.length > 0) {
          for (const p of places) {
            const rawName = p.display_name.split(',')[0].trim();
            const pLat = parseFloat(p.lat);
            const pLon = parseFloat(p.lon);
            if (!isNearbyDuplicate(pLat, pLon, rawName)) {
              seenCoords.push({ lat: pLat, lon: pLon, name: rawName });
              aggregatedResults.push({
                id: `osm-nom-${p.place_id}`,
                name: rawName,
                nameBn: /[\u0980-\u09FF]/.test(rawName) ? rawName : undefined,
                facilityType: 'Hospital',
                division: '',
                district: '',
                area: p.display_name.split(',').slice(1, 3).join(',').trim() || 'Nearby Area',
                ownership: 'Public',
                phone: '',
                emergencyPhone: '',
                latitude: pLat,
                longitude: pLon,
                verified: true,
                source: 'OpenStreetMap Live',
                lastVerifiedAt: new Date().toISOString()
              });
            }
          }
        }
      }
    } catch (nomErr) {
      console.warn("Nominatim fallback warning:", nomErr);
    }
  }

  return aggregatedResults;
}
