import { useState, useEffect } from 'react';

type NetworkQuality = 'offline' | 'poor' | 'medium' | 'good' | 'unknown';

interface NetworkStatus {
  isOnline: boolean;
  quality: NetworkQuality;
  effectiveType?: string;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    quality: 'unknown',
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      let quality: NetworkQuality = isOnline ? 'good' : 'offline';
      let effectiveType: string | undefined;

      // Type asserting for Network Information API support
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (isOnline && connection) {
        effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          quality = 'poor';
        } else if (effectiveType === '3g') {
          quality = 'medium';
        } else if (effectiveType === '4g') {
          quality = 'good';
        }
      } else if (!isOnline) {
         quality = 'offline';
      } else {
         // Fallback logic could be applied here if needed, but defaults to 'good' if online and api unsupported
         quality = 'good'; 
      }

      setStatus({ isOnline, quality, effectiveType });
    };

    updateNetworkStatus();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return status;
}
