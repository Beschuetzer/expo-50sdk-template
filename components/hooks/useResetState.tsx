import { resetLastUpcScanned } from "@/state/slices/generalSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

/**
*Resets the values on load that need to be reset (redux persist prevent this)
**/
export function useResetState() {
    const dispatch = useDispatch();

    useEffect(() => {
        alert('resetting state...')
        dispatch(resetLastUpcScanned());
    }, [])
}