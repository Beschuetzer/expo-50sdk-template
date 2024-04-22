import { GEOCODING_API_KEY } from '@env';

import { GpsCoordinate } from '@/types/Store';
import { displayAlert } from '@/utils/helpers';

const FORWARD_GEOCODING_API_URL = 'https://geocode.maps.co/search';
const REVERSE_GEOCODING_API_URL = 'https://geocode.maps.co/reverse';

/**
 *Uses {@link https://geocode.maps.co/ this} free API to perform reverse and regular geocoding
 **/
export async function doReverseGeoCoding(gpsCoordinate: GpsCoordinate) {
  try {
    const { lat, lon } = gpsCoordinate;
    if (!lat || !lon) {
      throw new Error('Please provide a valid latitude and longitude');
    }
    const urlParams = new URLSearchParams(`?lat=${lat}&lon=${lon}`);
    const url = `${REVERSE_GEOCODING_API_URL}?api_key=${GEOCODING_API_KEY}&${urlParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      const statusMsg = `Geocoding API returned a status of ${response.status}`;
      if (response.status >= 400 && response.status < 500) {
        throw new Error(
          `${statusMsg}.  Something is wrong with the request...`,
        );
      }
      throw new Error(
        `${statusMsg}. Unable to use geocoding at the moment.  Please try again shortly.`,
      );
    }
    return await response.json();
  } catch (error) {
    displayAlert({ error });
  }
}
