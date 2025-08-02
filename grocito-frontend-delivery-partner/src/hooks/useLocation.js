import { useState, useEffect } from 'react';
import { getAreaFromPincodeAPI, formatPartnerLocation } from '../utils/locationUtils';

/**
 * Custom hook for managing partner location with real-time API updates
 * @param {Object} partner - Partner object
 * @returns {Object} - Location data and loading state
 */
export const usePartnerLocation = (partner) => {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLocation = async () => {
      if (!partner) {
        setLocation('Location not available');
        return;
      }

      // If we already have area/city data, use it immediately
      if (partner.area || partner.city) {
        setLocation(formatPartnerLocation(partner));
        return;
      }

      // If we only have pincode, try to get area from API
      if (partner.pincode) {
        setLoading(true);
        try {
          const area = await getAreaFromPincodeAPI(partner.pincode);
          const enhancedPartner = { ...partner, area };
          setLocation(formatPartnerLocation(enhancedPartner));
        } catch (error) {
          console.error('Error loading location:', error);
          setLocation(formatPartnerLocation(partner));
        } finally {
          setLoading(false);
        }
      } else {
        setLocation('Location not available');
      }
    };

    loadLocation();
  }, [partner]);

  return { location, loading };
};

export default usePartnerLocation;