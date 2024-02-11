import {
  Stack,
  Input,
  Row,
  useTheme,
  Button,
  Center,
} from "native-base";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { InputText } from "./InputText";
import { AbsolutePositionedScreen } from "../AbsolutelyPositionedScreen";
import { InputValidationMessage } from "../InputValidationMessage";

import {
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
  GPS_COORDINATES_DEFAULT,
} from "@/constants/general";
import { storesListSelector } from "@/state/slices/listsSlice";
import { GpsCoordinate, Store } from "@/types/Store";
import { StoreProp } from "@/types/general";
import { displayAlert, getGpsCoordinate } from "@/utils/helpers";

type StoreFormValdation = {
  isValid: boolean;
  message: string;
};

type StoreFormProps = {
  onClose: () => void;
  onSave: (store: Store) => void;
} & StoreProp;

export function StoreForm(props: StoreFormProps) {
  const { onClose, onSave, store } = props;
  const theme = useTheme();
  const [storeName, setStoreName] = useState(store?.name || EMPTY_STRING);
  const [isLoadingGpscoords, setIsLoadingGpscoords] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<GpsCoordinate>(
    store?.gpsCoordinates || {
      ...GPS_COORDINATES_DEFAULT,
    },
  );
  const storesList = useSelector(storesListSelector);

  const formValidation: StoreFormValdation = useMemo(() => {
    const isValid = storeName.length > 0;
    return {
      isValid,
      message: isValid ? EMPTY_STRING : "A store name must be given",
    };
  }, [storeName]);

  function onClosePress() {
    onClose && onClose();
  }

  function onSavePress() {
    const itmeToSave = {
      name: storeName,
      gpsCoordinates,
    } as Store;
    onSave && onSave(itmeToSave);
    onClose && onClose();
  }

  async function onGetCurrentCoordinatesPress() {
    try {
      setIsLoadingGpscoords(true);
      const gpsCoordinate = await getGpsCoordinate();
      setGpsCoordinates(gpsCoordinate);
    } catch (error: any) {
      displayAlert(error);
    } finally {
      setIsLoadingGpscoords(false);
    }
  }

  return (
    <AbsolutePositionedScreen
      absolutelyPositionedJsx={
        <>
          <Row space={3}>
            <Button
              isDisabled={!formValidation.isValid}
              flex={1}
              onPress={onSavePress}
            >
              Save
            </Button>
            <Button flex={1} onPress={onClosePress}>
              Close
            </Button>
          </Row>
          <InputValidationMessage
            isValid={!storesList[storeName]}
            message={`An store with the key of '${storeName}' is already in the list and will be overriden.`}
          />
        </>
      }
    >
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <InputText>Name</InputText>
        <Input
          variant="outline"
          p={theme.space[1]}
          placeholder="Store Name"
          value={storeName}
          onChangeText={(newText) => setStoreName(newText)}
          isInvalid={storeName.length <= 0}
        />
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <Row alignItems="center">
          <InputText mr={theme.space[FORM_INTER_ITEM_SPACING]}>Lat:</InputText>
          <Input
            variant="outline"
            keyboardType="numeric"
            p={theme.space[1]}
            flex={1}
            placeholder="latitude"
            value={gpsCoordinates.lat.toString()}
            onChangeText={(newLat) =>
              setGpsCoordinates((current: GpsCoordinate) => {
                return {
                  ...current,
                  lat: newLat,
                };
              })
            }
            isInvalid={isNaN(parseFloat(gpsCoordinates.lat))}
          />
          <InputText mx={theme.space[FORM_INTER_ITEM_SPACING]}>Long:</InputText>
          <Input
            flex={1}
            variant="outline"
            keyboardType="numeric"
            p={theme.space[1]}
            placeholder="longitude"
            value={gpsCoordinates.lon.toString()}
            onChangeText={(newLong) =>
              setGpsCoordinates((current: GpsCoordinate) => {
                return {
                  ...current,
                  lon: newLong,
                };
              })
            }
            isInvalid={isNaN(parseFloat(gpsCoordinates.lon))}
          />
        </Row>
        <Center mt={theme.space[FORM_INTER_ITEM_SPACING]}>
          <Button
            isDisabled={isLoadingGpscoords}
            onPress={onGetCurrentCoordinatesPress}
          >
            Get Current
          </Button>
        </Center>
      </Stack>
    </AbsolutePositionedScreen>
  );
}
