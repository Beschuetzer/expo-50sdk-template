export type Store = {
    gpsCoordinates?: GpsCoordinate;
    name: string;
};

type GpsCoordinate = {
    lat: number;
    long: number;
}
