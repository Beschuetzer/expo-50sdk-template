import {
  AbstractService,
  GenericResponse,
} from '@/components/services/AbstractService';
import {
  DispatchNeeded,
  MakeCallInput,
} from '@/components/services/BffService';
import { GpsCoordinate } from '@/types/Store';
import { Address } from '@/types/general';

const GEO_CODING_SERVICE_BASE_URL = 'https://geocode.maps.co';

type Messages = Pick<Partial<MakeCallInput>, 'errorMsg' | 'loadingMsg'>;
export type ForwardGeocodingInput = {
  address: Address | null;
} & DispatchNeeded &
  Messages;

export type ReverseGeocodingInput = {
  gpsCoordinate: GpsCoordinate;
} & Messages &
  DispatchNeeded;

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

export type ReverseGeocodingResponse =
  | {
      place_id: number;
      licence: string;
      osm_type: string;
      osm_id: number;
      lat: string;
      lon: string;
      display_name: string;
      address: {
        building?: string;
        road?: string;
        suburb?: string;
        city?: string;
        county?: string;
        state?: string;
        'ISO3166?-2-lvl4': string;
        postcode?: string;
        country?: string;
        country_code?: string;
      };
      boundingbox: string[];
    }
  | GenericResponse;

export type ForwardGeocodingResponse =
  | ForwardGeocodingPlace[]
  | GenericResponse;

class GeoCodingService extends AbstractService {
  private _apiKey = process.env.EXPO_PUBLIC_GEOCODING_API_KEY;

  constructor() {
    super(GEO_CODING_SERVICE_BASE_URL);
  }

  /**
   *Uses {@link https://geocode.maps.co/ this} free API to perform reverse and regular geocoding
   **/
  async doForwardGeocoding(input: ForwardGeocodingInput) {
    const { address, dispatch, loadingMsg, errorMsg } = input;
    const urlParams = new URLSearchParams();
    console.log({ address });

    !!address?.addressLineOne &&
      urlParams.append('street', `${address.addressLineOne}`);
    !!address?.city && urlParams.append('city', address.city);
    !!address?.state && urlParams.append('state', address.state);
    !!address?.zipCode && urlParams.append('postalcode', address.zipCode);
    !!address?.country && urlParams.append('country', address.country);
    const path = `/search?api_key=${this._apiKey}&${urlParams.toString()}`;
    return await this.makeCall<ForwardGeocodingResponse>({
      path,
      errorMsg:
        errorMsg ||
        `Unable to find any locations matching ${address?.addressLineOne} with the given values.`,
      loadingMsg: loadingMsg || 'Finding locations that match address...',
      dispatch,
    });
  }

  /**
   *Uses {@link https://geocode.maps.co/ this} free API to perform reverse and regular geocoding
   **/
  async doReverseGeoCoding(
    input: ReverseGeocodingInput,
  ): Promise<ReverseGeocodingResponse> {
    const { gpsCoordinate, dispatch, errorMsg, loadingMsg } = input;
    const { lat, lon } = gpsCoordinate;
    if (!lat || !lon) {
      throw new Error('Please provide a valid latitude and longitude');
    }
    const urlParams = new URLSearchParams(`?lat=${lat}&lon=${lon}`);
    const path = `/reverse?api_key=${this._apiKey}&${urlParams.toString()}`;
    return await this.makeCall<ReverseGeocodingResponse>({
      path,
      errorMsg:
        errorMsg ||
        `Unable to obtain the address for lat: ${lat}, lon: ${lon}.`,
      loadingMsg:
        loadingMsg || `Finding address for  lat: ${lat}, lon: ${lon}.`,
      dispatch,
    });
  }
}

export const GEO_CODING_SERVICE = new GeoCodingService();
