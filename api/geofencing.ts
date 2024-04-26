import { GEOCODING_API_KEY } from '@env';

import { EMPTY_STRING } from '@/constants/general';
import { GpsCoordinate } from '@/types/Store';
import { Address } from '@/types/general';
import { displayAlert } from '@/utils/helpers';

const FORWARD_GEOCODING_API_URL = 'https://geocode.maps.co/search';
const REVERSE_GEOCODING_API_URL = 'https://geocode.maps.co/reverse';

/**
 *Uses {@link https://geocode.maps.co/ this} free API to perform reverse and regular geocoding
 **/
export async function doForwardGeoCoding(
  address: Address,
): Promise<GpsCoordinate> {
  try {
    const { addressLineOne, addressLineTwo, city, state, zipCode } = address;
    const queryString = encodeURIComponent(
      `${addressLineTwo} ${addressLineTwo} ${city} ${state} ${zipCode}`,
    );
    if (!addressLineOne || !queryString) {
      throw new Error('Please provide a valid address');
    }

    const urlParams = new URLSearchParams(`?q=${queryString}`);
    const url = `${FORWARD_GEOCODING_API_URL}?api_key=${GEOCODING_API_KEY}&${urlParams.toString()}`;
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
    const json = await response.json();
    return {
      lat: json.lat,
      lon: json.lon,
    }
  } catch (error) {
    displayAlert({ error });
    return {
      lat: -1,
      lon: -1,
    };
  }
}

/**
 *Uses {@link https://geocode.maps.co/ this} free API to perform reverse and regular geocoding
 **/
export async function doReverseGeoCoding(
  gpsCoordinate: GpsCoordinate,
): Promise<Address> {
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
    const json = await response.json();
    return {
      addressLineOne: `${json.house_number} ${json.road}`,
      city: json?.city || json?.town || json?.village,
      state: json.state,
      zipCode: json.postcode,
    } as Address;
  } catch (error) {
    displayAlert({ error });
    return {
      addressLineOne: EMPTY_STRING,
      city: EMPTY_STRING,
      state: EMPTY_STRING,
      zipCode: EMPTY_STRING,
    };
  }
}
