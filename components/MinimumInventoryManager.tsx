import { useToast, Text, Stack, Button, theme } from 'native-base';
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { StoreSelectionModal } from './modals/StoreSelectionModal';

import { EMPTY_NUMBER, EMPTY_STRING } from '@/constants/general';
import {
  inventoryItemSelector,
  itemInListsCountSelector,
  itemsListSelector,
  lastDecrementedItemIdSelector,
  lastPurchasedMapSelector,
  setLastDecrementedItemId,
  updateStoreSpecificValues,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { Item } from '@/types/Item';
import { Store } from '@/types/Store';
import { getExpirationDatesQuantity } from '@/utils/getExpirationDatesQuantity';
import { getKeyToUse } from '@/utils/helpers';

type LastItemProcessed = {
  amountToAdd: number;
  decrementedId: string;
  itemFound: Item;
  lastStoreId: string;
};

const LAST_ITEM_PROCESSED_DEFAULT: LastItemProcessed = Object.freeze({
  decrementedId: EMPTY_STRING,
  itemFound: {} as Item,
  lastStoreId: EMPTY_STRING,
  amountToAdd: EMPTY_NUMBER,
});

type CurrentInventoryAlertProps = {
  shouldOverrideRef?: MutableRefObject<boolean>;
};

const TOAST_DISPLAY_DURATION = 5000; // 5 seconds
export const MinimumInventoryManager = (props: CurrentInventoryAlertProps) => {
  const { shouldOverrideRef } = props;
  const toast = useToast();
  const dispatch = useAppDispatch();
  const lastDecrementedItemId = useAppSelector(lastDecrementedItemIdSelector);
  const items = useAppSelector(itemsListSelector);
  const lastPurchasedMap = useAppSelector(lastPurchasedMapSelector);
  const { inventoryItem } = useAppSelector(
    inventoryItemSelector({
      itemId: lastDecrementedItemId,
    }),
  );
  const itemInListsCount = useAppSelector(
    itemInListsCountSelector({
      itemId: lastDecrementedItemId,
    }),
  );
  const [isStoreSelectionModalVisible, setIsStoreSelectionModalVisible] =
    useState(false);

  const expirationDateQuantity = useMemo(
    () => getExpirationDatesQuantity(inventoryItem?.expirationDates),
    [inventoryItem?.expirationDates],
  );
  const storeIdOfMostRecentPurchase = useMemo(() => {
    let lastPurchasedId = EMPTY_STRING;
    let lastPurchasedTime = EMPTY_NUMBER;
    for (const [id, purchasedTime] of Object.entries(
      lastPurchasedMap?.[lastDecrementedItemId] || {},
    )) {
      if (purchasedTime > lastPurchasedTime) {
        lastPurchasedId = id;
        lastPurchasedTime = purchasedTime;
      }
    }
    return lastPurchasedId;
  }, [lastPurchasedMap, lastDecrementedItemId]);

  /**
   *This is needed to keep track of the last item processed in the toast.
   *This is because the toast is shown and then the dispatch is called to set the lastDecrementedItemId to an empty string.
   *If we don't keep track of the last item processed, we won't be able to get the item details when the user selects a store.
   **/
  const lastItemProcessed = useRef<LastItemProcessed>({
    ...LAST_ITEM_PROCESSED_DEFAULT,
  });

  const closeStoreSelectionModal = useCallback(() => {
    setIsStoreSelectionModalVisible(false);
  }, []);

  const onButtonPress = useCallback(() => {
    toast.closeAll();
    setIsStoreSelectionModalVisible(true);
  }, [toast]);

  const onStoreSelectionModalConfirm = useCallback(
    (store: Store | null) => {
      const quantityToAdd = lastItemProcessed.current.amountToAdd || 1;
      dispatch(
        updateStoreSpecificValues({
          key: {
            _id: lastItemProcessed.current.decrementedId,
            upc: EMPTY_STRING,
          },
          storeSpecificValuesToUpdate: {
            quantity: (currentQuantity: number) =>
              currentQuantity > 0
                ? currentQuantity + quantityToAdd
                : quantityToAdd,
          },
          storeId: getKeyToUse(store || EMPTY_STRING),
        }),
      );
      closeStoreSelectionModal();
    },
    [closeStoreSelectionModal, dispatch, lastItemProcessed],
  );

  // This effect is used to show a toast when the user decrements an item and the inventory minimum is not met.
  useEffect(() => {
    if (!lastDecrementedItemId || shouldOverrideRef?.current) return;
    const itemFound = items.data.find(
      (item) => getKeyToUse(item) === lastDecrementedItemId,
    );
    if (itemFound) {
      const { inventoryMinimum } = itemFound;
      lastItemProcessed.current = { ...LAST_ITEM_PROCESSED_DEFAULT };

      const currentInventoryAndListAmount = Math.max(
        (expirationDateQuantity == null
          ? inventoryMinimum - 1
          : expirationDateQuantity) + itemInListsCount,
        0,
      );

      const amountToAdd = inventoryMinimum - currentInventoryAndListAmount;
      let message = `You have decremented the quantity of '${itemFound.name}'.`;
      let isButtonDisabled = true;
      const shouldAskToAddItems =
        currentInventoryAndListAmount < inventoryMinimum;
      if (shouldAskToAddItems) {
        message += ` The inventory minimum is ${inventoryMinimum} and you only have ${currentInventoryAndListAmount} between your inventory and shopping lists. Press here to add ${amountToAdd} to a shopping list of your choice.`;
        isButtonDisabled = false;
        lastItemProcessed.current = {
          itemFound,
          decrementedId: lastDecrementedItemId,
          lastStoreId: storeIdOfMostRecentPurchase,
          amountToAdd,
        };
      }

      toast.show({
        placement: 'bottom',
        duration: TOAST_DISPLAY_DURATION,
        render: () => {
          return (
            <Stack
              bg={`${shouldAskToAddItems ? 'warning' : 'success'}.900`}
              borderRadius="md"
              p={4}
              mb={4}
            >
              <Button
                onPress={onButtonPress}
                variant="unstyled"
                isDisabled={isButtonDisabled}
              >
                <Text color={theme.colors.white} fontWeight="bold">
                  {message}
                </Text>
              </Button>
            </Stack>
          );
        },
      });
    }

    dispatch(setLastDecrementedItemId(EMPTY_STRING));
  }, [
    lastDecrementedItemId,
    shouldOverrideRef,
    items,
    toast,
    lastPurchasedMap,
    dispatch,
    storeIdOfMostRecentPurchase,
    itemInListsCount,
    expirationDateQuantity,
  ]);

  return (
    <StoreSelectionModal
      canSelectCurrentStore
      initialStoreId={lastItemProcessed.current.lastStoreId}
      isVisible={isStoreSelectionModalVisible}
      title="Select a Store"
      onConfirm={onStoreSelectionModalConfirm}
      onBlurPress={closeStoreSelectionModal}
      onCancel={closeStoreSelectionModal}
    />
  );
};
