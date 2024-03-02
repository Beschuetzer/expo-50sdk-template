import { useState, useEffect } from 'react';

import { EMPTY_STRING } from '@/constants/general';
import { GpsCoordinate } from '@/types/Store';
import { getGpsCoordinate } from '@/utils/helpers';

type UseGpsCoordinatesProps = {
  onSuccess?: (gpsCoordinates: GpsCoordinate) => void;
};
export function useGpsCoordinate(props?: UseGpsCoordinatesProps) {
  const { onSuccess } = props || {};
  const [gpsCoordinates, setGpsCoordinates] = useState<
    GpsCoordinate | undefined
  >(undefined);
  const [errorMsg, setErrorMsg] = useState(EMPTY_STRING);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const gpsCoordinate = await getGpsCoordinate();
        onSuccess && onSuccess(gpsCoordinate);
        setGpsCoordinates(gpsCoordinate);
      } catch (error: any) {
        setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return {
    gpsCoordinates,
    errorMsg,
    isLoading,
  };
}
