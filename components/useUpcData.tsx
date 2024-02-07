import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  resetLastUpcScanned,
} from "@/state/slices/generalSlice";
import { addUpcProduct, upcProductSelector } from "@/state/slices/scannerSlice";
import { UpcProduct, UpcResponse } from "@/types/UpcResponse";
import { UpcProp } from "@/types/general";
import { delay } from "@/utils/helpers";

type UseUpcProductProps = {
  onSuccessfulFetch?: (upcProduct: UpcProduct) => void;
} & UpcProp;

export function useUpcProduct(props: UseUpcProductProps) {
  const { onSuccessfulFetch, upc } = props;
  const upcProduct = useSelector(upcProductSelector(upc));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [product, setProduct] = useState<UpcProduct | null>(null);
  const dispatch = useDispatch();

  const fetchUpcData = useCallback(async () => {
    const url = `https://world.openfoodfacts.org/api/v0/product/${upc}`;
    try {
      setIsLoading(true);
      setErrorMsg(null);
      // alert(`fetching data for ${url}`);
      // const response = await fetch(url);

      const response = await handleMockResponse(upc)
      if (response.ok) {
        const data = (await response.json()) as UpcResponse;
        const upcProduct = data.product;
        if (!upcProduct.code && !upcProduct.id && !upcProduct.product_name) {
          upcProduct.product_name = "N/A";
          upcProduct.brands = "N/A";
        }
        dispatch(addUpcProduct(upcProduct));
        setProduct(upcProduct);
        onSuccessfulFetch && onSuccessfulFetch(upcProduct);
      } else {
        setErrorMsg(
          `Invalid resopnse from service for '${upc}'.  Make sure you have a data connection and try again in a few seconds.`,
        );
        setProduct(null);
      }
    } catch (error) {
      setErrorMsg(`Error fetching data for '${upc}': ${error}.`);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [upc]);

  useEffect(() => {
    if (upcProduct) {
      dispatch(resetLastUpcScanned());
      setProduct(upcProduct);
      onSuccessfulFetch && onSuccessfulFetch(upcProduct);
    } else if (upc.match(/\d{12,13}/i)) {
      fetchUpcData();
    }
  }, [upc]);

  return {
    upcProduct: product,
    isLoading,
    errorMsg,
  };
}

export const MOCKS_UPCS = [
  "096619107698",
  "043000054017",
  "072273487253",
  "072273487254",
];
async function handleMockResponse(upc: string) {
  await delay(1000);
  const MOCKS = {
    [MOCKS_UPCS[0]]: {
      code: MOCKS_UPCS[0],
      status: 1,
      status_verbose: "worked",
      product: {
        brands: "Kirkland Signature",
        code: MOCKS_UPCS[0],
        id: MOCKS_UPCS[0],
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
    },
    [MOCKS_UPCS[1]]: {
      code: MOCKS_UPCS[1],
      status: 1,
      status_verbose: "worked",
      product: {
        code: MOCKS_UPCS[1],
        id: MOCKS_UPCS[1],
        image_front_small_url:
          "https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.200.jpg",
        image_front_thumb_url:
          "https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.100.jpg",
        image_front_url:
          "https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.400.jpg",
        image_ingredients_small_url:
          "https://images.openfoodfacts.org/images/products/004/300/005/4017/ingredients_en.35.200.jpg",
        image_ingredients_thumb_url:
          "https://images.openfoodfacts.org/images/products/004/300/005/4017/ingredients_en.35.100.jpg",
        image_ingredients_url:
          "https://images.openfoodfacts.org/images/products/004/300/005/4017/ingredients_en.35.400.jpg",
        image_nutrition_small_url:
          "https://images.openfoodfacts.org/images/products/004/300/005/4017/nutrition_en.22.200.jpg",
        image_nutrition_thumb_url:
          "https://images.openfoodfacts.org/images/products/004/300/005/4017/nutrition_en.22.100.jpg",
        image_nutrition_url:
          "https://images.openfoodfacts.org/images/products/004/300/005/4017/nutrition_en.22.400.jpg",
        image_small_url:
          "https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.200.jpg",
        image_thumb_url:
          "https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.100.jpg",
        image_url:
          "https://images.openfoodfacts.org/images/products/004/300/005/4017/front_en.26.400.jpg",
        product_name: "Chocolate",
        brands: "Some Company LLC.",
      } as UpcProduct,
    },
    [MOCKS_UPCS[2]]: {
      code: MOCKS_UPCS[2],
      status: 1,
      status_verbose: "worked",
      product: {
        brands: "SW,Del Monte Foods",
        code: MOCKS_UPCS[2],
        id: MOCKS_UPCS[2],
        product_name: "Beans",
        image_front_small_url:
          "https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.200.jpg",
        image_front_thumb_url:
          "https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.100.jpg",
        image_front_url:
          "https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.400.jpg",
        image_ingredients_small_url:
          "https://images.openfoodfacts.org/images/products/007/227/348/7253/ingredients_en.9.200.jpg",
        image_ingredients_thumb_url:
          "https://images.openfoodfacts.org/images/products/007/227/348/7253/ingredients_en.9.100.jpg",
        image_ingredients_url:
          "https://images.openfoodfacts.org/images/products/007/227/348/7253/ingredients_en.9.400.jpg",
        image_nutrition_small_url:
          "https://images.openfoodfacts.org/images/products/007/227/348/7253/nutrition_en.10.200.jpg",
        image_nutrition_thumb_url:
          "https://images.openfoodfacts.org/images/products/007/227/348/7253/nutrition_en.10.100.jpg",
        image_nutrition_url:
          "https://images.openfoodfacts.org/images/products/007/227/348/7253/nutrition_en.10.400.jpg",
        image_small_url:
          "https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.200.jpg",
        image_thumb_url:
          "https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.100.jpg",
        image_url:
          "https://images.openfoodfacts.org/images/products/007/227/348/7253/front_en.8.400.jpg",
      },
    },
    [MOCKS_UPCS[3]]: {
      code: "",
      status: 1,
      status_verbose: "worked",
      product: {
        brands: "",
        code: "",
        id: "",
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
        product_name: "",
      } as UpcProduct,
    },
  } as unknown as { [key: string]: UpcResponse };
  const toReturn = MOCKS[upc];
  console.log({ toReturn, upc });

  return new Response(JSON.stringify(toReturn));
}
