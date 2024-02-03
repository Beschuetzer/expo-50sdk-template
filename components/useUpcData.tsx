import { lastUpcScannedSelector } from "@/state/slices/generalSlice";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export function useUpcData() {
    const lastUpcScanned = useSelector(lastUpcScannedSelector);
    const [data, setData] = useState(null)

    useEffect(() => {
        console.log(lastUpcScanned);
        
    }, [lastUpcScanned])
}