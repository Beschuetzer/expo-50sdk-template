import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  lastUpcScannedSelector,
  resetLastUpcScanned,
  setLastUpcScanned,
} from "@/state/slices/generalSlice";
import {
  AspectRatio,
  Button,
  FlatList,
  Heading,
  Text,
  View,
  Image,
  Row,
} from "native-base";
import {
  resetUpcProducts,
  upcProductsSelector,
} from "@/state/slices/scannerSlice";
import { UpcProduct } from "@/types/UpcResponse";

export function ReduxViewer() {
  const lastUpcScanned = useSelector(lastUpcScannedSelector);
  const upcProducts = useSelector(upcProductsSelector);
  const dispatch = useDispatch();

  function renderFieldAndText(key: string, value: any) {
    return (
      <Text fontWeight={"bold"}>
        {key}: <Text fontWeight={"normal"}>{value}</Text>
      </Text>
    );
  }

  function renderImages(upcProduct: UpcProduct) {
    const imagesToRender = [
      upcProduct.image_front_thumb_url,
      upcProduct.image_ingredients_thumb_url,
      upcProduct.image_thumb_url,
      upcProduct.image_nutrition_url,
    ];

    return (
      <Row>
        {imagesToRender.map((imageUrl) => {
          return (
            <AspectRatio
              ratio={{
                base: 3 / 4,
                md: 9 / 10,
              }}
              height={{
                base: 100,
                md: 75,
              }}
            >
              <Image
                resizeMode="cover"
                source={{
                  uri: imageUrl,
                }}
                alt="Thumbnail"
              />
            </AspectRatio>
          );
        })}
      </Row>
    );
  }

  return (
    <FlatList
      data={Object.values(upcProducts || {})}
      renderItem={(data) => {
        const { item } = data;
        console.log({ data });
        return (
          <View>
            <Heading size={"sm"} mt={3}>
              '{item._id}' details:
            </Heading>
            {renderFieldAndText("Name", item.product_name)}
            {renderFieldAndText(
              "Fetched At",
              new Date(item.timestamp).toLocaleString()
            )}
            {renderImages(item)}
          </View>
        );
      }}
      ListHeaderComponent={
        <>
          <Button onPress={() => dispatch(setLastUpcScanned("test"))}>
            Set to 'test'
          </Button>
          <Button onPress={() => dispatch(resetLastUpcScanned())}>
            Reset lastUpcScanned
          </Button>
          <Button onPress={() => dispatch(resetUpcProducts())}>
            Reset upcProducts
          </Button>
          <Text>The lastUpcScanned is: {lastUpcScanned}</Text>
        </>
      }
    />
  );
}
