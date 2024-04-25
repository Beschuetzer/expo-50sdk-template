import { GEOCODING_API_KEY } from '@env';

import { GpsCoordinate } from '@/types/Store';
import { Address } from '@/types/geofencing';
import { displayAlert } from '@/utils/helpers';
import { EMPTY_STRING } from '@/constants/general';

const FORWARD_GEOCODING_API_URL = 'https://geocode.maps.co/search';
const REVERSE_GEOCODING_API_URL = 'https://geocode.maps.co/reverse';

// {
//   place_id: 332658382,
//   licence: "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
//   osm_type: "way",
//   osm_id: 226443680,
//   lat: "45.029704300000006",
//   lon: "-93.03937747032404",
//   display_name: "Costco, 1431, Beam Avenue, Maplewood, Ramsey County, Minnesota, 55109, United States",
//   address: {
//   shop: "Costco",
//   house_number: "1431",
//   road: "Beam Avenue",
//   town: "Maplewood",
//   county: "Ramsey County",
//   state: "Minnesota",
//   ISO3166-2-lvl4: "US-MN",
//   postcode: "55109",
//   country: "United States",
//   country_code: "us"
//   },
//   boundingbox: [
//   "45.0289637",
//   "45.030301",
//   "-93.0400921",
//   "-93.0386622"
//   ]
// }

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
