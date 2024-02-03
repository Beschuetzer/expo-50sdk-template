import {
  lastUpcScannedSelector,
  resetLastUpcScanned,
  setLastUpcScanned,
} from "@/state/slices/generalSlice";
import {
  addUpcProduct,
  upcProductSelector,
  upcProductsSelector,
} from "@/state/slices/scannerSlice";
import { UpcProduct, UpcResponse } from "@/types/UpcResponse";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const LAST_UPC_PRODUCT_REF_INITIAL = JSON.stringify({});

export function useUpcData() {
  const lastUpcScanned = useSelector(lastUpcScannedSelector);
  const lastUpcProductRef = useRef(LAST_UPC_PRODUCT_REF_INITIAL);
  const upcProduct = useSelector(upcProductSelector(lastUpcScanned));
  const [data, setData] = useState<UpcProduct | null>(null);
  const dispatch = useDispatch();

  const fetchUpcData = useCallback(
    async (upcToFetch: string) => {
      try {
        alert(
          `fetching data for https://world.openfoodfacts.org/api/v0/product/${upcToFetch}`
        );
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v0/product/${upcToFetch}`
        );
        if (response.ok) {
          const data = (await response.json()) as UpcResponse;
          alert(
            `result for https://world.openfoodfacts.org/api/v0/product/${upcToFetch} is: ${JSON.stringify(
              data.code
            )}`
          );
          dispatch(addUpcProduct(data.product));
          setData(data.product);
        } else {
          alert(`Unable to fetch data for '${upcToFetch}'`);
          setData(null);
        }
      } catch (error) {
        alert(`Error fetching data for '${lastUpcScanned}': ${error}`);
        setData(null);
      }

      dispatch(resetLastUpcScanned());
      return () => {
        lastUpcProductRef.current = LAST_UPC_PRODUCT_REF_INITIAL;
      };
    },
    [lastUpcProductRef]
  );

  useEffect(() => {
    if (!lastUpcScanned && !upcProduct) {
      lastUpcProductRef.current = LAST_UPC_PRODUCT_REF_INITIAL;
    }
  }, [lastUpcScanned]);

  useEffect(() => {
    // const stringified = JSON.stringify(upcProduct);
    // if (!lastUpcScanned || lastUpcProductRef.current === stringified) {
    //   console.log("skipping scanning in useEffect of for useUpcData");
    //   return;
    // }
    // lastUpcProductRef.current = stringified;
    alert(lastUpcScanned);
    console.log({
      lastUpcScanned,
      upcProductId: upcProduct?.id,
    });
    if (upcProduct) {
      alert("using cached data");
      setData(upcProduct);
    } else if (lastUpcScanned) {
      // fetchUpcData(lastUpcScanned);
      handleMockResponse(dispatch);
    } else {
      setLastUpcScanned("");
    }
  }, [lastUpcScanned, upcProduct]);

  return data;
}

function handleMockResponse(dispatch: any) {
  alert('using mock data...');
  const data = {
    code: "096619107698",
    status: 1,
    status_verbose: "worked",
    product: {
      code: "096619107698",
      id: "0096619107698",
      image_front_small_url:
        "https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.200.jpg",
      image_front_thumb_url:
        "https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.100.jpg",
      image_front_url:
        "https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.400.jpg",
      image_ingredients_small_url:
        "https://images.openfoodfacts.org/images/products/009/661/910/7698/ingredients_en.27.200.jpg",
      image_ingredients_thumb_url:
        "https://images.openfoodfacts.org/images/products/009/661/910/7698/ingredients_en.27.100.jpg",
      image_ingredients_url:
        "https://images.openfoodfacts.org/images/products/009/661/910/7698/ingredients_en.27.400.jpg",
      image_nutrition_small_url:
        "https://images.openfoodfacts.org/images/products/009/661/910/7698/nutrition_en.28.200.jpg",
      image_nutrition_thumb_url:
        "https://images.openfoodfacts.org/images/products/009/661/910/7698/nutrition_en.28.100.jpg",
      image_nutrition_url:
        "https://images.openfoodfacts.org/images/products/009/661/910/7698/nutrition_en.28.400.jpg",
      image_small_url:
        "https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.200.jpg",
      image_thumb_url:
        "https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.100.jpg",
      image_url:
        "https://images.openfoodfacts.org/images/products/009/661/910/7698/front_en.14.400.jpg",
      product_name: "Shelled Pistachios",
    } as UpcProduct,
  } as unknown as UpcResponse;
  dispatch(addUpcProduct(data.product));
}
