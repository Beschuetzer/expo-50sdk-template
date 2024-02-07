import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Text, useTheme, Container, View, Center, Heading } from "native-base";
import { useRef, useMemo, useCallback, useEffect } from "react";
import { ActivityIndicator, Dimensions, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { UpcDetails } from "./UpcDetails";
import { useUpcProduct } from "./useUpcData";

import {
  lastUpcScannedSelector,
  setUpcProductToDisplay,
} from "@/state/slices/generalSlice";
import { UpcProduct } from "@/types/UpcResponse";
import { useNavigation } from "expo-router";

type UpcDetailsSheetProps = object;

const snapPointPercents = [25, 50, 75, 100];
const defaultSnappoint = snapPointPercents.length - 1;

export function UpcDetailsModal(props: UpcDetailsSheetProps) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const windowDimensions = Dimensions.get("window");
  const { upcProduct, isLoading, errorMsg } = useUpcProduct({
    onSuccessfulFetch: (upcProduct: UpcProduct) => {
      navigation.navigate('modal', {upcProduct});
      // dispatch(setUpcProductToDisplay(upcProduct || ({} as UpcProduct)));
    },
  });
  const theme = useTheme();
  const lastUpcScanned = useSelector(lastUpcScannedSelector);
  const snapPoints = useMemo(
    () => snapPointPercents.map((snapPointPercent) => `${snapPointPercent}%`),
    [snapPointPercents],
  );
  const currentSnapPointRef = useRef(defaultSnappoint);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const closeModal = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, [bottomSheetModalRef]);

  const openModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
    bottomSheetModalRef.current?.snapToIndex(snapPoints.length - 1);
  }, [bottomSheetModalRef]);

  const onSheetChange = useCallback((index: number) => {
    if (index < 0) {
      console.log("closed modal");
    } else {
      currentSnapPointRef.current = index;
      console.log("opened modal");
    }
  }, []);

  // useEffect(() => {
  //   if (!upcProduct && !isLoading) return;
  //   openModal();
  // }, [lastUpcScanned]);

  //#region Rendering
  function renderContent() {
    const width = windowDimensions.width;
    const height =
      (windowDimensions.height *
        snapPointPercents[currentSnapPointRef.current]) /
      100;

    if (isLoading) {
      return (
        <Center width={width} height={height}>
          <Text>Checking for UPC data...</Text>
          <ActivityIndicator size="large" color={theme.colors.black} />
        </Center>
      );
    }
    if (upcProduct) {
      return <UpcDetails onClose={closeModal} />;
    }
    if (errorMsg) {
      return (
        <Center width={width} height={height}>
          <Heading>Error Fetching Data</Heading>
          <Text>{errorMsg}</Text>
        </Center>
      );
    }
    return (
      <Container size="full">
        <Text>Unable to retreive data for '{lastUpcScanned}'</Text>
      </Container>
    );
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={defaultSnappoint}
      snapPoints={snapPoints}
      onChange={onSheetChange}
    >
      <BottomSheetScrollView keyboardShouldPersistTaps="always">
        {renderContent()}
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
  //#endregion
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});

