import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Stack, Input, Row, useTheme, Button } from 'native-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { AddressForm } from './AddressForm';
import { InputText } from './InputText';
import { AbsolutePositionedScreen } from '../AbsolutelyPositionedScreen';
import { BottomSheetModalWithFixedHeader } from '../BottomSheetModalWithFixedHeader';
import { InputValidationMessage } from '../InputValidationMessage';
import { ForwardGeoCodingModal } from '../modals/ForwardGeoCodingModal';

import {
  DoForwardGeocodingResponse,
  ForwardGeocodingPlace,
  doForwardGeocoding,
} from '@/api/geofencing';
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
import { Address, StoreProp } from '@/types/general';
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
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [storeName, setStoreName] = useState(store?.name || EMPTY_STRING);
  const [isLoadingGpscoords, setIsLoadingGpscoords] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<GpsCoordinate>(
    store?.gpsCoordinates || {
      ...GPS_COORDINATES_DEFAULT,
    },
  );
  const [placeToUse, setPlaceToUse] = useState<ForwardGeocodingPlace>(null);
  const [positionsToShowInModal, setPlacesToShowInModal] =
    useState<DoForwardGeocodingResponse>([]);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const addressSheetRef = useRef<BottomSheetModalMethods>(null);
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
  const addressRef = useRef<Address | null>(null);

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

  const onGetCurrentCoordinatesPress = useCallback(async () => {
    try {
      setIsLoadingGpscoords(true);
      const gpsCoordinate = await getGpsCoordinate();
      setGpsCoordinates(gpsCoordinate);
    } catch (error: any) {
      displayAlert(error);
    } finally {
      setIsLoadingGpscoords(false);
    }
  }, []);

  const onAddressChange = useCallback(
    (address: Address, isValid: boolean) => {
      addressRef.current = address;
      setIsAddressValid(isValid);
    },
    [addressRef.current],
  );

  const onAddressFormSubmitPress = useCallback(async () => {
    const places = await doForwardGeocoding(addressRef.current);

    if (!places || places.length === 0) {
      alert('No places found');
    } else if (places.length === 1) {
      setPlaceToUse(places[0]);
    } else {
      setPlacesToShowInModal(places);
    }
  }, [addressRef.current]);

  const onUseAddressPress = useCallback(() => {
    addressSheetRef.current?.present();
  }, [addressSheetRef.current]);

  useEffect(() => {
    if (placeToUse?.lat && placeToUse.lon) {
      setGpsCoordinates({
        lat: placeToUse?.lat,
        lon: placeToUse?.lon,
      });
    }
  }, [placeToUse]);

  useEffect(() => {
    if (!originalKey) {
      nameInputRef.current?.focus();
    }
  }, [originalKey]);

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
          ref={nameInputRef}
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
        <Row
          pt={theme.space[FORM_INTER_ITEM_SPACING]}
          alignItems="center"
          justifyContent="space-between"
        >
          <Button
            isDisabled={isLoadingGpscoords}
            onPress={onGetCurrentCoordinatesPress}
          >
            Use Current
          </Button>
          <Button isDisabled={isLoadingGpscoords} onPress={onUseAddressPress}>
            Use Address
          </Button>
        </Row>
      </Stack>
      <BottomSheetModalWithFixedHeader
        ref={addressSheetRef}
        title="Geofencing"
        onSubmit={onAddressFormSubmitPress}
        submitButton={{
          validation: {
            isValid: isAddressValid,
            message: 'Please enter a city, state, or zip code.',
          },
          isEnabled: isAddressValid,
          text: 'Search',
        }}
      >
        <AddressForm onValueChange={onAddressChange} />
      </BottomSheetModalWithFixedHeader>
      <ForwardGeoCodingModal
        onConfirm={(place) => {
          setPlacesToShowInModal([]);
          setPlaceToUse(place);
          addressSheetRef.current?.dismiss();
        }}
        onCancel={() => {
          setPlacesToShowInModal([]);
          setPlaceToUse(null);
        }}
        isVisible={positionsToShowInModal.length > 0}
        places={positionsToShowInModal}
      />
    </AbsolutePositionedScreen>
  );
}
