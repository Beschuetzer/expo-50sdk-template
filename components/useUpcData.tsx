import { lastUpcScannedSelector } from "@/state/slices/generalSlice";
import { addUpcProduct, upcProductsSelector } from "@/state/slices/scannerSlice";
import { UpcProduct, UpcResponse } from "@/types/UpcResponse";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useUpcData() {
    const lastUpcScanned = useSelector(lastUpcScannedSelector);
    const upcProducts = useSelector(upcProductsSelector);
    const [data, setData] = useState<UpcProduct | null>(null)
    const dispatch = useDispatch();

    const fetchUpcData = useCallback(async () => {
        try {
            const response = await fetch(
              `https://world.openfoodfacts.org/api/v0/product/${lastUpcScanned}`
            );
            if (response.ok) {
                const data = await response.json() as UpcResponse;
                console.log({data});
                dispatch(addUpcProduct(data.product))
                setData(data.product);
            } else {
                alert(`Unable to fetch data for '${lastUpcScanned}'`)
                setData(null);
            }
        } catch (error) {
            alert(`Error fetching data for '${lastUpcScanned}': ${error}`)
                setData(null);
        }
    }, [lastUpcScanned])

    useEffect(() => {
        console.log(lastUpcScanned);
        const cachedData = upcProducts?.[lastUpcScanned];
        if (cachedData) {
            setData(cachedData);
        } else if (lastUpcScanned){
            fetchUpcData();
        }
    }, [lastUpcScanned])

    return data;
}