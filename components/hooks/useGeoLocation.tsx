import * as Location from "expo-location";
import { useState, useEffect } from "react";

import { EMPTY_STRING } from "@/constants/general";
import { getGpsCoordinates } from "@/utils/helpers";

export function useGeoLocation() {
  const [location, setLocation] = useState<Location.LocationObject | undefined>(
    undefined,
  );
  const [errorMsg, setErrorMsg] = useState(EMPTY_STRING);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await getGpsCoordinates();
        setLocation(response);
      } catch (error: any) {
        setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return {
    location,
    errorMsg,
    isLoading,
  };
}
