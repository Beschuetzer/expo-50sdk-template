import { Picker } from '@react-native-picker/picker';
import { FlashList } from '@shopify/flash-list';
import { Stack, Text, useTheme, Button, Row } from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';

import {
  EMPTY_STRING,
  ESTIMATED_SIZE_FOR_STORE_SELECTION_MODAL,
  FORM_INTER_ITEM_SPACING,
} from '@/constants/general';
import {
  currentInventoryLocationSelector,
  currentStoreIdSelector,
  inventoryLocationsSelector,
  storeSpecificListSelector,
} from '@/state/slices/listsSlice';
import { useAppSelector } from '@/state/store';
import {
  ItemWithStoreSpecificValues,
  StoreSpecificValueKey,
} from '@/types/Item';
import { InventoryLocation } from '@/types/inventory';
import { ListName } from '@/types/listSlice';
import { getKeyToUse } from '@/utils/helpers';

export type CompletePurchaseModalProps = Omit<
  ModalWithBlurProps,
  'children' | 'onConfirm'
> & {
  onConfirm: (
    itemToLocationMap: CompletePurchaseModalItemToLocationMap,
  ) => void;
};

export type CompletePurchaseModalItemToLocationMap = {
  [itemId: string]: {
    locationId: string;
    quantity: number;
  } & Pick<ItemWithStoreSpecificValues, 'timeToExpiration'>;
};

export function CompletePurchaseModal(props: CompletePurchaseModalProps) {
  const { isVisible, onConfirm, onCancel } = props;
  const theme = useTheme();
  const inCartList = useAppSelector(
    storeSpecificListSelector(ListName.InCartList),
  );
  const currentStoreId = useAppSelector(currentStoreIdSelector);
  const inventoryLocations = useAppSelector(inventoryLocationsSelector);
  const currentInventoryLocation = useAppSelector(
    currentInventoryLocationSelector,
  );
  const [itemToLocationMap, setItemToLocationMap] =
    useState<CompletePurchaseModalItemToLocationMap>({});
  const hasSetInitialStateRef = useRef(false);

  const reset = useCallback(() => {
    setItemToLocationMap({});
    hasSetInitialStateRef.current = false;
  }, []);

  const onCancelPressLocal = useCallback(() => {
    onCancel && onCancel();
  }, [onCancel]);

  const onConfirmPressLocal = useCallback(() => {
    reset();
    onConfirm && onConfirm(itemToLocationMap);
  }, [onConfirm, reset, itemToLocationMap]);

  const onSetAllToCurrent = useCallback(() => {
    setItemToLocationMap((current) => {
      return inCartList.reduce((acc, item) => {
        return {
          ...acc,
          [getKeyToUse(item)]: {
            locationId: currentInventoryLocation?._id || EMPTY_STRING,
            timeToExpiration: item.timeToExpiration,
            quantity:
              item?.[StoreSpecificValueKey.Quantity]?.[currentStoreId] || 1,
          },
        };
      }, current);
    });
  }, [inCartList, currentInventoryLocation?._id]);

  const onSetAllToDoNotAssign = useCallback(() => {
    setItemToLocationMap((current) => {
      return inCartList.reduce((acc, item) => {
        return {
          ...acc,
          [getKeyToUse(item)]: {
            locationId: EMPTY_STRING,
            timeToExpiration: item.timeToExpiration,
            quantity:
              item?.[StoreSpecificValueKey.Quantity]?.[currentStoreId] || 1,
          },
        };
      }, current);
    });
  }, [inCartList, currentStoreId]);

  /**
   * This effect is used to trigger the onConfirm callback when the modal is opened but there are no inventory locations available.
   * This is to ensure that the user can still complete the purchase even if there are no inventory locations available.
   **/
  useEffect(() => {
    if (isVisible && (!inventoryLocations || inventoryLocations.length <= 0)) {
      onConfirm && onConfirm(itemToLocationMap);
    }
  }, [isVisible, inventoryLocations, itemToLocationMap, onConfirm]);

  useEffect(() => {
    hasSetInitialStateRef.current = false;
  }, [currentInventoryLocation?._id]);

  useEffect(() => {
    if (hasSetInitialStateRef.current || !isVisible) return;
    hasSetInitialStateRef.current = true;
    setItemToLocationMap(
      inCartList.reduce((initial, item) => {
        return {
          ...initial,
          [getKeyToUse(item)]: {
            locationId: currentInventoryLocation?._id || EMPTY_STRING,
            timeToExpiration: item.timeToExpiration,
            quantity:
              item?.[StoreSpecificValueKey.Quantity]?.[currentStoreId] || 1,
          },
        };
      }, {} as CompletePurchaseModalItemToLocationMap),
    );
  }, [isVisible, inCartList]);

  if (!isVisible || !inventoryLocations || inventoryLocations.length <= 0)
    return null;
  return (
    <ModalWithBlur
      {...props}
      onConfirm={onConfirmPressLocal}
      onCancel={onCancelPressLocal}
    >
      <FlashList
        estimatedItemSize={ESTIMATED_SIZE_FOR_STORE_SELECTION_MODAL}
        keyboardShouldPersistTaps="always"
        data={inCartList}
        ListHeaderComponent={
          <Row
            justifyContent="space-between"
            alignItems="center"
            space={theme.space[FORM_INTER_ITEM_SPACING]}
            mb={theme.space[FORM_INTER_ITEM_SPACING] * 2}
          >
            <Button size="sm" variant="solid" onPress={onSetAllToDoNotAssign}>
              Set all to "Do not assign"
            </Button>
            <Button size="sm" variant="solid" onPress={onSetAllToCurrent}>
              Set all to Current
            </Button>
          </Row>
        }
        keyExtractor={(item) => getKeyToUse(item)}
        renderItem={({ item, index }) => {
          const itemKey = getKeyToUse(item);
          return (
            <Stack
              key={itemKey}
              pt={theme.space[FORM_INTER_ITEM_SPACING] * 2}
              borderColor={theme.colors.gray[200]}
              borderTopWidth={index === 0 ? 1 : 0}
              borderWidth={1}
            >
              <Text
                ml={theme.space[FORM_INTER_ITEM_SPACING] * 2}
                fontStyle="italic"
                fontSize={theme.fontSizes.sm}
              >
                {item.name}:
              </Text>
              <Picker
                selectedValue={
                  itemToLocationMap?.[item?._id || EMPTY_STRING]?.locationId ??
                  (currentInventoryLocation?._id || EMPTY_STRING)
                }
                onValueChange={(locationId: string = EMPTY_STRING) => {
                  setItemToLocationMap((current) => ({
                    ...current,
                    [itemKey]: {
                      ...current[itemKey],
                      timeToExpiration: item.timeToExpiration,
                      locationId,
                    },
                  }));
                }}
              >
                {[
                  {
                    _id: EMPTY_STRING,
                    name: 'Do not assign',
                    description: 'Do not assign to any location',
                  } as InventoryLocation,
                  ...inventoryLocations,
                ].map((location) => (
                  <Picker.Item
                    key={getKeyToUse(location)}
                    label={location.name}
                    value={getKeyToUse(location._id)}
                  />
                ))}
              </Picker>
            </Stack>
          );
        }}
      />
    </ModalWithBlur>
  );
}
