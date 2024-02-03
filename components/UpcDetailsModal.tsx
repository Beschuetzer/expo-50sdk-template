import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet } from "react-native";
import { UpcDetails } from "./UpcDetails";
import { useUpcProduct } from "./useUpcData";
import { Text, useTheme, Container, View, Center } from "native-base";
import { useSelector } from "react-redux";
import { lastUpcScannedSelector } from "@/state/slices/generalSlice";

type UpcDetailsSheetProps = {};

const snapPointPercents = [25, 50, 75, 100];
const defaultSnappoint = snapPointPercents.length - 2;

export function UpcDetailsModal(props: UpcDetailsSheetProps) {
  const windowDimensions = Dimensions.get("window");
  const { upcProduct, isLoading } = useUpcProduct();
  const theme = useTheme();
  const lastUpcScanned = useSelector(lastUpcScannedSelector);

  const snapPoints = useMemo(
    () => snapPointPercents.map((snapPointPercent) => `${snapPointPercent}%`),
    [snapPointPercents]
  );
  const currentSnapPointRef = useRef(defaultSnappoint);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const openModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const onSheetChange = useCallback((index: number) => {
    if (index < 0) {
      console.log("closed modal");
    } else {
      currentSnapPointRef.current = index;
      console.log("opened modal");
    }
  }, []);

  useEffect(() => {
    if (!upcProduct && !isLoading) return;
    openModal();
  }, [lastUpcScanned]);

  //#region Rendering
  function renderContent() {
    if (isLoading) {
      console.log({
        windowDimensionsHeight: windowDimensions.height,
        factor: snapPointPercents[currentSnapPointRef.current] / 100,
        currentSnapPointRef: currentSnapPointRef.current,
      });

      return (
        <Center
          width={windowDimensions.width}
          height={
            (windowDimensions.height *
              snapPointPercents[currentSnapPointRef.current]) /
            100
          }
        >
          <ActivityIndicator size={"large"} color={theme.colors.black} />
        </Center>
      );
    }
    if (upcProduct) {
      return <UpcDetails upcProduct={upcProduct} />;
    }
    return (
      <Container size={"full"}>
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
      {renderContent()}
    </BottomSheetModal>
  );
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
