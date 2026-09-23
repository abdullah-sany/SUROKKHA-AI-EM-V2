import { useState, useCallback } from 'react';
import { LocationState } from '../types';

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({ status: 'idle' });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation({ status: 'unsupported', error: 'Geolocation is not supported by your browser.' });
      return;
    }

    setLocation({ status: 'loading' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          status: 'granted',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let status: LocationState['status'] = 'unavailable';
        if (error.code === error.PERMISSION_DENIED) {
          status = 'denied';
        } else if (error.code === error.TIMEOUT) {
          status = 'timeout';
        }
        setLocation({ status, error: error.message });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  return { location, requestLocation };
}
