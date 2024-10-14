import { Store } from '@/types/Store';
import { getId } from '@/utils/helpers';

function getRemainingData() {
  return {
    _id: getId(),
    addedDate: Date.now(),
    addressLineOne: 'abc123',
    addressLineTwo: 'Apt 203',
    calculatedDistance: -1100,
    city: 'Maplewood',
    country: 'US',
    hasBeenSaved: false,
    needsSaving: true,
    state: 'MN',
    zipCode: '55109',
  } as Partial<Store>;
}

export const MOCK_STORES = [
  {
    name: `Costco`,
    gpsCoordinates: {
      lat: '45.0297043',
      lon: '-93.0393775',
    },
    ...getRemainingData(),
  },
  {
    name: `Target in North St. Paul, MN`,
    gpsCoordinates: {
      lat: '45.011662',
      lon: '-93.005648',
    },
    ...getRemainingData(),
  },
  {
    name: `Cub`,
    gpsCoordinates: {
      lat: '45.0147066',
      lon: '-93.0198135',
    },
    ...getRemainingData(),
  },
  {
    name: `Walmart`,
    gpsCoordinates: {
      lat: '45.1547066',
      lon: '-93.2298135',
    },
    ...getRemainingData(),
  },
  {
    name: `Sam's Club`,
    gpsCoordinates: {
      lat: '46.0947066',
      lon: '-93.8098135',
    },
    ...getRemainingData(),
  },
] as Required<Store>[];
