import { fetchWrapper } from './fetchWrapper.js';
// Geocoding utility using Mapbox API
export const geocodeAddress = async (address) => {
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.warn('Mapbox access token not found. Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file');
    return null;
  }

  try {
    const response = await fetchWrapper(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${accessToken}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}; 