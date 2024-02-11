import { Store } from "@/types/Store";

export const MOCK_STORES = [
  {
    name: `Costco`,
    gpsCoordinates: {
      lat: '45.0297043',
      lon: '-93.0393775',
    },
  },
  {
    name: `Target`,
    gpsCoordinates: {
      lat: '45.011662',
      lon: '-93.005648',
    },
  },
  {
    name: `Cub`,
    gpsCoordinates: {
      lat: '45.0147066',
      lon: '-93.0198135',
    },
  },
] as Store[]