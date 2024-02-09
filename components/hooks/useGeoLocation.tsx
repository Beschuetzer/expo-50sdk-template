import * as Location from "expo-location";
import { useState, useEffect } from "react";

import { EMPTY_STRING } from "@/constants/general";

export function useGeoLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState(EMPTY_STRING);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
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
