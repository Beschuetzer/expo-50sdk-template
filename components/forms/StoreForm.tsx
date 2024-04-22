import { Stack, Input, Row, useTheme, Button, Center } from 'native-base';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { InputText } from './InputText';
import { AbsolutePositionedScreen } from '../AbsolutelyPositionedScreen';
import { InputValidationMessage } from '../InputValidationMessage';

import {
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
  GPS_COORDINATES_DEFAULT,
} from '@/constants/general';
import {
  AddStoresListItemPayload,
  storesListSelector,
} from '@/state/slices/listsSlice';
import { canOverrideStoreSelector } from '@/state/slices/optionsSlice';
import { GpsCoordinate, Store } from '@/types/Store';
import { StoreProp } from '@/types/general';
import {
  displayAlert,
  getGpsCoordinate,
  getItemFromList,
  getKeyToUse,
} from '@/utils/helpers';

type StoreFormValdation = {
  isValid: boolean;
  message: string;
};

type StoreFormProps = {
  onClose: () => void;
  onSave: (addStoresListItemPayload: AddStoresListItemPayload) => void;
} & StoreProp &
  Pick<AddStoresListItemPayload, 'originalKey'>;

export function StoreForm(props: StoreFormProps) {
  const { originalKey, onClose, onSave, store } = props;
  const theme = useTheme();
  const [storeName, setStoreName] = useState(store?.name || EMPTY_STRING);
  const [isLoadingGpscoords, setIsLoadingGpscoords] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<GpsCoordinate>(
    store?.gpsCoordinates || {
      ...GPS_COORDINATES_DEFAULT,
    },
  );
  const canOverrideStore = useSelector(canOverrideStoreSelector);
  const storesList = useSelector(storesListSelector);
  const originalKeyToUse = useMemo(
    () => getKeyToUse(originalKey),
    [originalKey],
  );
  const isProposedStorePresent = useMemo(
    () =>
      !!getItemFromList(storesList.data, {
        name: storeName || EMPTY_STRING,
        upc: EMPTY_STRING,
      }),
    [storeName, storesList],
  );
  const isUpdatingStore = useMemo(
    () => originalKeyToUse && storeName.trim() === originalKeyToUse,
    [storeName, originalKeyToUse],
  );

  const formValidation: StoreFormValdation = useMemo(() => {
    const isValid = storeName.length > 0;
    return {
      isValid,
      message: isValid ? EMPTY_STRING : 'A store name must be given',
    };
  }, [storeName]);

  function onClosePress() {
    onClose && onClose();
  }

  function onSavePress() {
    const newStore = {
      name: storeName,
      gpsCoordinates,
    } as Store;
    onSave &&
      onSave({
        newStore,
        originalKey,
      });
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
              isDisabled={
                (!formValidation.isValid ||
                  (!canOverrideStore && isProposedStorePresent)) &&
                !isUpdatingStore
              }
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
            isValid={
              (!!originalKeyToUse && originalKeyToUse === storeName) ||
              !isProposedStorePresent
            }
            message={
              canOverrideStore
                ? `An store with the name of '${storeName}' is already in the list and will be overriden.`
                : `Please enable overriding stores or remove the store with name of '${storeName}'`
            }
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
          <InputText
            style={{ marginRight: theme.space[FORM_INTER_ITEM_SPACING] }}
          >
            Lat:&nbsp;
          </InputText>
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
          <InputText
            style={{ marginHorizontal: theme.space[FORM_INTER_ITEM_SPACING] }}
          >
            Long:&nbsp;
          </InputText>
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
