import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import _ from 'lodash';
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
  AUTO_SAVE_DEBOUNCE_THRESHOLD,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
  GPS_COORDINATES_DEFAULT,
} from '@/constants/general';
import {
  AddStoresListItemPayload,
  storesListSelector,
} from '@/state/slices/listsSlice';
import {
  autoSaveStoresSelector,
  canOverrideStoreSelector,
} from '@/state/slices/optionsSlice';
import { Store } from '@/types/Store';
import { Address, StoreProp } from '@/types/general';
import {
  displayAlert,
  getAreStoresEqual,
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

type StoreFormData = Omit<Store, 'calculatedDistance'>;
/**
 *Handles store inputs
 **/
export function StoreForm(props: StoreFormProps) {
  const { originalKey, onClose, onSave, store } = props;
  const theme = useTheme();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<StoreFormData>({
    name: store?.name || EMPTY_STRING,
    gpsCoordinates: store?.gpsCoordinates || {
      ...GPS_COORDINATES_DEFAULT,
    },
  });
  const [isLoadingGpscoords, setIsLoadingGpscoords] = useState(false);
  const [placeToUse, setPlaceToUse] = useState<ForwardGeocodingPlace>(null);
  const [positionsToShowInModal, setPlacesToShowInModal] =
    useState<DoForwardGeocodingResponse>([]);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const addressSheetRef = useRef<BottomSheetModalMethods>(null);
  const canOverrideStore = useSelector(canOverrideStoreSelector);
  const storesList = useSelector(storesListSelector);
  const autoSaveStores = useSelector(autoSaveStoresSelector);
  const originalKeyToUse = useMemo(
    () => getKeyToUse(originalKey),
    [originalKey],
  );
  const isProposedStorePresent = useMemo(
    () =>
      !!getItemFromList(storesList.data, {
        name: formData.name || EMPTY_STRING,
        upc: EMPTY_STRING,
      }),
    [formData.name, storesList],
  );
  const isUpdatingStore = useMemo(
    () => originalKeyToUse && formData.name.trim() === originalKeyToUse,
    [formData.name, originalKeyToUse],
  );
  const addressRef = useRef<Address | null>(null);

  const formValidation: StoreFormValdation = useMemo(() => {
    const isValid = formData.name.length > 0;
    return {
      isValid,
      message: isValid ? EMPTY_STRING : 'A store name must be given',
    };
  }, [formData.name]);
  const isSavingDisabled = useMemo(
    () =>
      (!formValidation.isValid ||
        (!canOverrideStore && isProposedStorePresent)) &&
      !isUpdatingStore,
    [formValidation, canOverrideStore, isProposedStorePresent, isUpdatingStore],
  );
  const autoSaveTimeoutRef = useRef<any>();

  const onClosePress = useCallback(() => {
    onClose && onClose();
  }, [onClose]);

  const onSavePress = useCallback(
    (shouldClose = true) => {
      onSave &&
        onSave({
          newStore: formData,
          originalKey,
        });
      if (!shouldClose) return;
      onClose && onClose();
    },
    [onClose, onSave, formData, originalKey],
  );

  const onGetCurrentCoordinatesPress = useCallback(async () => {
    try {
      setIsLoadingGpscoords(true);
      const gpsCoordinate = await getGpsCoordinate();
      setFormData((current) => ({
        ...current,
        gpsCoordinates: gpsCoordinate,
      }));
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
      setFormData((current) => ({
        ...current,
        gpsCoordinates: {
          lat: placeToUse?.lat,
          lon: placeToUse?.lon,
        },
      }));
    }
  }, [placeToUse]);

  useEffect(() => {
    if (!originalKey) {
      nameInputRef.current?.focus();
    }
  }, [originalKey]);

  //handling autoSave
  useEffect(() => {
    clearInterval(autoSaveTimeoutRef.current);
    if (!autoSaveStores || isSavingDisabled) return;

    const currentItem = storesList.data.find(
      (store) => getKeyToUse(store) === formData.name,
    );
    const key = getKeyToUse(formData);

    if (getAreStoresEqual(currentItem, formData)) return;

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (!key) return;
      onSavePress(false);
    }, AUTO_SAVE_DEBOUNCE_THRESHOLD);

    return () => {
      clearInterval(autoSaveTimeoutRef.current);
    };
  }, [
    isSavingDisabled,
    autoSaveStores,
    formData,
    onSavePress,
    storesList.data,
    autoSaveTimeoutRef,
  ]);

  return (
    <AbsolutePositionedScreen
      absolutelyPositionedJsx={
        <>
          <Row space={3}>
            {!autoSaveStores ? (
              <Button
                isDisabled={isSavingDisabled}
                flex={1}
                onPress={() => onSavePress()}
              >
                Save
              </Button>
            ) : null}
            <Button flex={1} onPress={onClosePress}>
              Close
            </Button>
          </Row>
          <InputValidationMessage
            isValid={
              (!!originalKeyToUse && originalKeyToUse === formData.name) ||
              !isProposedStorePresent
            }
            message={
              canOverrideStore
                ? `An store with the name of '${formData.name}' is already in the list and will be overriden.`
                : `Please enable overriding stores or remove the store with name of '${formData.name}'`
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
          value={formData.name}
          onChangeText={(newText) =>
            setFormData((current) => ({ ...current, name: newText }))
          }
          isInvalid={formData.name.length <= 0}
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
            value={formData.gpsCoordinates?.lat.toString()}
            onChangeText={(newLat) =>
              setFormData((current) => ({
                ...current,
                gpsCoordinates: {
                  ...current.gpsCoordinates,
                  lat: newLat,
                },
              }))
            }
            isInvalid={isNaN(
              parseFloat(formData?.gpsCoordinates?.lat || EMPTY_STRING),
            )}
          />
          <InputText
            style={{ marginHorizontal: theme.space[FORM_INTER_ITEM_SPACING] }}
          >
            Long:&nbsp;
          </InputText>
          <Input
            variant="outline"
            keyboardType="numeric"
            p={theme.space[1]}
            flex={1}
            placeholder="longitude"
            value={formData.gpsCoordinates?.lon.toString()}
            onChangeText={(newLon) =>
              setFormData((current) => ({
                ...current,
                gpsCoordinates: {
                  ...current.gpsCoordinates,
                  lon: newLon,
                },
              }))
            }
            isInvalid={isNaN(
              parseFloat(formData?.gpsCoordinates?.lon || EMPTY_STRING),
            )}
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
