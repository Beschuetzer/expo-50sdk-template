import { useState, useEffect } from "react";

import { EMPTY_STRING } from "@/constants/general";
import { GpsCoordinate } from "@/types/Store";
import { getGpsCoordinates } from "@/utils/helpers";

export function useGpsCoordinates() {
  const [gpsCoordinates, setGpsCoordinates] = useState<
    GpsCoordinate | undefined
  >(undefined);
  const [errorMsg, setErrorMsg] = useState(EMPTY_STRING);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await getGpsCoordinates();
        setGpsCoordinates(response);
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
