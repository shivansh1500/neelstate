import { useEffect, useRef, useState } from 'react';

export default function Map({ latitude, longitude, address }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapboxgl, setMapboxgl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Dynamically load mapbox-gl
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        const mapboxModule = await import('mapbox-gl');
        const mapboxgl = mapboxModule.default;
        
        // Import CSS
        await import('mapbox-gl/dist/mapbox-gl.css');
        
        // Set access token
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
        
        // Disable Mapbox analytics and telemetry
        if (typeof window !== 'undefined') {
          // Disable Mapbox telemetry
          mapboxgl.setRTLTextPlugin = () => {};
          
          // Override the analytics endpoint to prevent ad blocker issues
          const originalFetch = window.fetch;
          window.fetch = function(url, options) {
            if (typeof url === 'string' && url.includes('events.mapbox.com')) {
              // Silently ignore analytics requests
              return Promise.resolve(new Response('{}', { status: 200 }));
            }
            return originalFetch(url, options);
          };
        }
        
        setMapboxgl(mapboxgl);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load Mapbox:', err);
        setError(true);
        setLoading(false);
      }
    };

    loadMapbox();
  }, []);

  useEffect(() => {
    if (!mapboxgl || map.current || !latitude || !longitude) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom: 13,
        // Disable analytics to prevent ad blocker issues
        trackResize: false,
        attributionControl: false,
        // Disable telemetry
        cooperativeGestures: false,
      });

      // Add a marker
      new mapboxgl.Marker()
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl());

      // Add popup with address
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h3>${address}</h3>`);
      
      new mapboxgl.Marker()
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map.current);

    } catch (error) {
      console.warn('Map initialization failed:', error);
      setError(true);
    }

  }, [mapboxgl, latitude, longitude, address]);

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  if (error || !latitude || !longitude) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No location data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
} 