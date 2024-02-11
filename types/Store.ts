export type Store = {
  gpsCoordinates?: GpsCoordinate
  name: string
  calculatedDistance?: number;
}

export type GpsCoordinate = {
  lat: string
  lon: string
}

