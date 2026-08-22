import { FontAwesome } from '@expo/vector-icons';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useNavigation } from 'expo-router';
import _ from 'lodash';
import {
  Stack,
  Row,
  useTheme,
  Button,
  HStack,
  Pressable,
  Text,
} from 'native-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AddressForm } from './AddressForm';
import GeolocationInput from './GeolocationInput';
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
import { Routes } from '@/constants/navigation';
import { setError } from '@/state/slices/generalSlice';
import {
  currentLocationStateSelector,
  routesForStoreSelector,
  storesListSelector,
} from '@/state/slices/listsSlice';
import { autoSaveStoresSelector } from '@/state/slices/optionsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { GpsCoordinate, Route, Store } from '@/types/Store';
import { Address, StoreProp } from '@/types/general';
import { AddStoresListItemPayload } from '@/types/listSlice';
import {
  getAreStoresEqual,
  getEmptyStore,
  getKeyToUse,
  getStateFromString,
  trimObjectValues,
} from '@/utils/helpers';
import { parseAddress } from '@/utils/parseAddress';
import { InputText } from './InputText';

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
  const navigation = useNavigation();
  const storesList = useAppSelector(storesListSelector);
  const autoSaveStores = useAppSelector(autoSaveStoresSelector);
  const currentLocationState = useAppSelector(currentLocationStateSelector);
  const storeId = useMemo(
    () => (store ? getKeyToUse(store) : EMPTY_STRING),
    [store],
  );
  const storeRoutes = useAppSelector(routesForStoreSelector(storeId));
  const [formData, setFormData] = useState(
    getEmptyStore(store, currentLocationState),
  );
  const [searchAddress, setSearchAddress] = useState(getEmptyStore());
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

  const onGeoLocationChange = useCallback((gpsCoordinates: GpsCoordinate) => {
    setFormData((current) => ({
      ...current,
      gpsCoordinates,
    }));
  }, []);

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

  const onEditRoute = useCallback(
    (route: Route) => {
      // @ts-ignore
      navigation.navigate(Routes.RouteCreationScreen, {
        storeId,
        storeName: store?.name,
        routeId: route.id,
      });
    },
    [navigation, storeId, store?.name],
  );

  const onManageRoutesPress = useCallback(() => {
    // @ts-ignore
    navigation.navigate(Routes.RouteSelectionScreen, {
      storeId,
      storeName: store?.name,
    });
  }, [navigation, storeId, store?.name]);

  const onSearchAddressChange = useCallback(
    (address: Address, isValid: boolean) => {
      setSearchAddress((current) => ({
        ...current,
        ...address,
        name: address.addressLineOne || EMPTY_STRING,
      }));
      setIsAddressValid(isValid);
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
      <GeolocationInput
        onChange={onGeoLocationChange}
        initialCoordinates={formData.gpsCoordinates}
      >
        <FontAwesomeButton name="search" onPress={onSearchPress} />
      </GeolocationInput>
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
      {store ? (
        <Stack mt={theme.space[FORM_INTER_ITEM_SPACING]}>
          <Row justifyContent="space-between" alignItems="center" mb={2}>
            <InputText>Routes</InputText>
            <Pressable onPress={onManageRoutesPress} hitSlop={8}>
              <Text
                fontSize="xs"
                fontWeight="700"
                color={theme.colors.primary[600]}
              >
                Manage Routes
              </Text>
            </Pressable>
          </Row>
          {storeRoutes.length === 0 ? (
            <Text fontSize="xs" color={theme.colors.muted[400]}>
              No routes for this store yet.
            </Text>
          ) : (
            <Stack space={1}>
              {storeRoutes.map((route) => (
                <Pressable
                  key={route.id}
                  onPress={() => onEditRoute(route)}
                  _pressed={{ opacity: 0.5 }}
                >
                  <HStack
                    alignItems="center"
                    justifyContent="space-between"
                    px={3}
                    py={2}
                    borderWidth={1}
                    borderColor={theme.colors.muted[200]}
                    borderRadius={6}
                  >
                    <Stack flex={1}>
                      <Text fontSize="sm" fontWeight="600" numberOfLines={1}>
                        {route.name}
                      </Text>
                      <Text fontSize="2xs" color={theme.colors.muted[500]}>
                        {route.locations.length} location
                        {route.locations.length !== 1 ? 's' : ''}
                      </Text>
                    </Stack>
                    <Pressable
                      onPress={() => onEditRoute(route)}
                      hitSlop={8}
                      p={2}
                      _pressed={{ opacity: 0.5 }}
                    >
                      <FontAwesome
                        name="pencil"
                        size={14}
                        color={theme.colors.muted[500]}
                      />
                    </Pressable>
                  </HStack>
                </Pressable>
              ))}
            </Stack>
          )}
        </Stack>
      ) : null}
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
