import { GEOCODING_API_KEY } from '@env';

import { EMPTY_STRING } from '@/constants/general';
import { GpsCoordinate } from '@/types/Store';
import { Address, State } from '@/types/general';
import { displayAlert, isAddressValid } from '@/utils/helpers';

const FORWARD_GEOCODING_API_URL = 'https://geocode.maps.co/search';
const REVERSE_GEOCODING_API_URL = 'https://geocode.maps.co/reverse';

export type ForwardGeocodingPlace = {
  place_id?: number;
  licence?: string;
  osm_type?: string;
  osm_id?: number;
  boundingbox?: string[];
  lat: string;
  lon: string;
  display_name?: string;
  class?: string;
  type?: string;
  importance?: number;
} | null;

export type DoForwardGeocodingResponse = ForwardGeocodingPlace[];

/**
 *Uses {@link https://geocode.maps.co/ this} free API to perform reverse and regular geocoding
 **/
export async function doForwardGeocoding(address: Address) {
  try {
    const queryString = getForwardGeocodingQuery(address);
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
    const json = (await response.json()) as DoForwardGeocodingResponse;
    return json;
  } catch (error) {
    displayAlert({ error });
    return [];
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

export function getForwardGeocodingQuery(address: Address) {
  if (!isAddressValid(address)) {
    throw new Error('Please provide a valid address');
  }

  const { addressLineOne, addressLineTwo, city, state, zipCode } =
    address || {};
  return encodeURIComponent(
    `${addressLineOne || EMPTY_STRING} ${addressLineTwo || EMPTY_STRING} ${city || EMPTY_STRING} ${state === State.None ? EMPTY_STRING : state} ${zipCode || EMPTY_STRING}`,
  );
}
