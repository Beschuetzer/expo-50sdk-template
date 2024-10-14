import { AddedDate, HasBeenSaved, Id, NeedsSaving } from './Item';
import { Address } from './general';

export type Store = {
  gpsCoordinates?: GpsCoordinate;
  name: string;
  calculatedDistance?: number;
} & Partial<Address> &
  Id &
  NeedsSaving &
  AddedDate &
  HasBeenSaved;

export type GpsCoordinate = {
  lat: string;
  lon: string;
};
