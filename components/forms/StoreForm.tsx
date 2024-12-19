import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import _ from 'lodash';
import { Stack, Input, Row, useTheme, Button } from 'native-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AddressForm } from './AddressForm';
import { InputText } from './InputText';
import { AbsolutePositionedScreen } from '../AbsolutelyPositionedScreen';
import { BottomSheetModalWithFixedHeader } from '../BottomSheetModalWithFixedHeader';
import { FontAwesomeButton } from '../FontAwesomeButton';
import { ForwardGeoCodingModal } from '../modals/ForwardGeoCodingModal';

import {
  ForwardGeocodingPlace,
  GEO_CODING_SERVICE,
} from '@/components/services/GeoCodingService';
import {
  AUTO_SAVE_DEBOUNCE_THRESHOLD,
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
} from '@/constants/general';
import { setError, setLoading } from '@/state/slices/generalSlice';
import {
  currentLocationStateSelector,
  storesListSelector,
} from '@/state/slices/listsSlice';
import { autoSaveStoresSelector } from '@/state/slices/optionsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { Store } from '@/types/Store';
import { Address, StoreProp } from '@/types/general';
import { AddStoresListItemPayload } from '@/types/listSlice';
import {
  displayAlert,
  getAreStoresEqual,
  getEmptyStore,
  getGpsCoordinate,
  getKeyToUse,
  getStateFromString,
  trimObjectValues,
} from '@/utils/helpers';
import { openMap } from '@/utils/openMap';
import { parseAddress } from '@/utils/parseAddress';

type StoreFormValdation = {
  isValid: boolean;
  message: string;
};

export type StoreFormProps = {
  onClose: () => void;
  onSave: (addStoresListItemPayload: AddStoresListItemPayload) => void;
} & StoreProp;

/**
 *Handles store inputs
 **/
export function StoreForm(props: StoreFormProps) {
  const { onClose, onSave, store } = props;
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const storesList = useAppSelector(storesListSelector);
  const autoSaveStores = useAppSelector(autoSaveStoresSelector);
  const currentLocationState = useAppSelector(currentLocationStateSelector);
  const [formData, setFormData] = useState(
    getEmptyStore(store, currentLocationState),
  );
  const [searchAddress, setSearchAddress] = useState(getEmptyStore());
  const [isLoadingGpscoords, setIsLoadingGpscoords] = useState(false);
  const [placeToUse, setPlaceToUse] = useState<ForwardGeocodingPlace>(null);
  const [positionsToShowInModal, setPlacesToShowInModal] = useState<
    ForwardGeocodingPlace[]
  >([]);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const addressSheetRef = useRef<BottomSheetModalMethods>(null);
  const formValidation: StoreFormValdation = useMemo(() => {
    const isValid = formData.name.length > 0;
    return {
      isValid,
      message: isValid ? EMPTY_STRING : 'A store name must be given',
    };
  }, [formData.name]);

  const isSavingDisabled = useMemo(
    () => !formValidation.isValid,
    [formValidation],
  );

  const nameToUse = useMemo(
    () => formData.addressLineOne || formData.name,
    [formData],
  );
  const searchNameToUse = useMemo(
    () => searchAddress.name || searchAddress.addressLineOne,
    [searchAddress],
  );
  const autoSaveTimeoutRef = useRef<any>();

  const onClosePress = useCallback(() => {
    onClose && onClose();
  }, [onClose]);

  const onSavePress = useCallback(
    (shouldClose = true) => {
      const toSave = {
        newStore: {
          ...trimObjectValues(formData),
          addedDate: Date.now(),
        },
      };
      toSave.newStore.needsSaving = true;
      if (store) {
        const areEqual = _.isEqual(
          {
            ...toSave.newStore,
            ...getStandardizedValuesForComparison(),
          } as Store,
          {
            ...trimObjectValues(store),
            ...getStandardizedValuesForComparison(),
          } as Store,
        );
        toSave.newStore.needsSaving = store.needsSaving || !areEqual;
      }

      onSave && onSave(toSave);
      if (!shouldClose) return;
      onClose && onClose();
    },
    [onClose, onSave, formData],
  );

  const onGetCurrentCoordinatesPress = useCallback(async () => {
    try {
      setIsLoadingGpscoords(true);
      dispatch(setLoading('Fetching current coordinates...'));
      const gpsCoordinate = await getGpsCoordinate();
      setFormData((current) => ({
        ...current,
        gpsCoordinates: gpsCoordinate,
      }));
    } catch (error: any) {
      displayAlert(error);
    } finally {
      setIsLoadingGpscoords(false);
      dispatch(setLoading(EMPTY_STRING));
    }
  }, []);

  const onAddressChange = useCallback((address: Address, isValid: boolean) => {
    setIsAddressValid(isValid);
    setFormData((current) => ({
      ...current,
      ...address,
      name: address.addressLineOne || EMPTY_STRING,
    }));
  }, []);

  const onAddressFormSubmitPress = useCallback(async () => {
    const places = await GEO_CODING_SERVICE.doForwardGeocoding({
      address: searchAddress,
      dispatch,
    });

    if (!places || places.length === 0) {
      dispatch(
        setError({
          message: 'No places found',
          error: {
            message: `Value for key is '${process.env.EXPO_PUBLIC_GEOCODING_API_KEY?.substring(0, 3)}...${process.env.EXPO_PUBLIC_GEOCODING_API_KEY?.substring(process.env.EXPO_PUBLIC_GEOCODING_API_KEY.length - 3)}'`,
          },
        }),
      );
    } else if (places.length === 1) {
      setPlaceToUse(places[0]);
      addressSheetRef.current?.dismiss();
    } else {
      setPlacesToShowInModal(places || []);
    }
  }, [searchAddress, addressSheetRef.current]);

  const onSearchPress = useCallback(() => {
    setSearchAddress(
      getEmptyStore({
        name: formData.name,
        addressLineOne: nameToUse,
        state: formData.state || currentLocationState,
      } as Store),
    );
    addressSheetRef.current?.present();
  }, [addressSheetRef.current, formData, nameToUse, currentLocationState]);

  const onMapPress = useCallback(() => {
    openMap({
      dispatch,
      ...formData.gpsCoordinates,
      label: formData.name,
    });
  }, [formData]);

  const onSearchAddressChange = useCallback(
    (address: Address, isValid: boolean) => {
      setSearchAddress((current) => ({
        ...current,
        ...address,
        name: address.addressLineOne || EMPTY_STRING,
      }));
    },
    [],
  );

  useEffect(() => {
    if (placeToUse?.lat && placeToUse?.lon) {
      const address = parseAddress(placeToUse.display_name);
      setFormData((current) => ({
        ...current,
        ...address,
        name: address.addressLineOne || EMPTY_STRING,
        gpsCoordinates: {
          lat: placeToUse?.lat,
          lon: placeToUse?.lon,
        },
      }));
    }
  }, [placeToUse]);

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
        </>
      }
    >
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <Row alignItems="center" space={theme.space[FORM_INTER_ITEM_SPACING]}>
          <InputText>Lat:&nbsp;</InputText>
          <Input
            variant="outline"
            keyboardType="numeric"
            p={theme.space[1]}
            flex={1}
            placeholder="latitude"
            value={formData.gpsCoordinates?.lat.toString()}
            onChangeText={(newLat) => {
              setFormData(
                (current) =>
                  ({
                    ...current,
                    gpsCoordinates: {
                      ...current.gpsCoordinates,
                      lat: newLat,
                    },
                  }) as any,
              );
            }}
          />
          <InputText>Long:&nbsp;</InputText>
          <Input
            variant="outline"
            keyboardType="numeric"
            p={theme.space[1]}
            flex={1}
            placeholder="longitude"
            value={formData.gpsCoordinates?.lon.toString()}
            onChangeText={(newLon) => {
              setFormData(
                (current) =>
                  ({
                    ...current,
                    gpsCoordinates: {
                      ...current.gpsCoordinates,
                      lon: newLon,
                    },
                  }) as any,
              );
            }}
          />
          {!formData.gpsCoordinates.lat ||
          !formData.gpsCoordinates.lon ||
          !formData.name ? null : (
            <FontAwesomeButton
              size={theme.sizes[8]}
              style={{
                paddingHorizontal: theme.space[FORM_INTER_ITEM_SPACING] * 2,
              }}
              name="map-marker"
              onPress={onMapPress}
            />
          )}
        </Row>
        <Row
          pt={theme.space[FORM_INTER_ITEM_SPACING]}
          alignItems="center"
          justifyContent="space-between"
        >
          <FontAwesomeButton
            name="globe"
            buttonProps={{ disabled: isLoadingGpscoords }}
            onPress={onGetCurrentCoordinatesPress}
          />
          <FontAwesomeButton
            name="search"
            buttonProps={{ disabled: isLoadingGpscoords }}
            onPress={onSearchPress}
          />
        </Row>
      </Stack>
      <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
        <AddressForm
          onValueChange={onAddressChange}
          onValueChangeTimeout={0}
          options={{
            addressLineOne: {
              name: 'Name',
              value: nameToUse,
            },
            addressLineTwo: { value: formData.addressLineTwo },
            city: { value: formData.city },
            state: { value: getStateFromString(formData.state) },
            zipCode: { value: formData.zipCode },
            country: { value: formData.country },
          }}
        />
      </Stack>
      <BottomSheetModalWithFixedHeader
        ref={addressSheetRef}
        title="Search Stores"
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
        <AddressForm
          onValueChange={onSearchAddressChange}
          options={{
            addressLineOne: {
              name: 'Store Name',
              value: searchNameToUse,
              suffix: { text: '*' },
            },
            addressLineTwo: { isVisible: false },
            city: {
              suffix: { text: '**' },
            },
            country: {
              suffix: { text: '*' },
            },
            state: {
              suffix: { text: '**' },
              value: currentLocationState,
            },
            zipCode: {
              suffix: { text: '**' },
            },
          }}
        />
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

/**
 *This returns a store with values that don't need to be compared
 **/
function getStandardizedValuesForComparison() {
  return {
    needsSaving: false,
    calculatedDistance: 0,
    addedDate: 0,
  } as Partial<Store>;
}
