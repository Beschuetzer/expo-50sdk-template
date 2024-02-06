import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { resetLastUpcScanned } from "@/state/slices/generalSlice";

/**
 *Resets the values on load that need to be reset (redux persist prevent this)
 **/
export function useResetState() {
  const dispatch = useDispatch();

  useEffect(() => {
    alert("resetting state...");
    dispatch(resetLastUpcScanned());
  }, []);
}
