import { AddedDate, HasBeenSaved, Id, NeedsSaving } from './Item';
import { Address } from './general';

export type Store = {
  calculatedDistance?: number;
  gpsCoordinates?: GpsCoordinate;
  name: string;
  routes: Route[];
} & Partial<Address> &
  Id &
  NeedsSaving &
  AddedDate &
  HasBeenSaved;

export type GpsCoordinate = {
  lat: string;
  lon: string;
};

export type Route = {
  id: string;
  locations: string[];
  name: string;
  storeId: string;
  userId: string;
  userIdsWithAccess: string[];
};
