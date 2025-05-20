import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from 'expo-router';
import {
  Box,
  Button,
  Center,
  Row,
  Text,
  useTheme,
  useToast,
  Stack,
} from 'native-base';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';

import FilterListInput from './FilterListInput';
import { MinimumInventoryManager } from './MinimumInventoryManager';
import { AddButton } from './header/AddButton';
import { RemoveButton } from './header/RemoveButton';
import { useMenu } from './hooks/useMenu';
import { useUpcProduct } from './hooks/useUpcProduct';
import { ListItemSeparator } from './lists/ListItemSeparator';
import { SwipeableRow } from './lists/SwipeableRow';
import { SortType } from './lists/sorters';
import {
  AddItemToInventoryModal,
  AddItemToInventoryModalProps,
} from './modals/AddItemToInventoryModal';
import { BarcodeScannerModal } from './modals/BarcodeScannerModal';
import { ConfirmModal, ConfirmModalProps } from './modals/ConfirmModal';
import QuantityModifierModal from './modals/QuantityModifierModal';
import { ItemFormSheet } from './sheets/ItemFormSheet';
import { ItemTileBasicContent } from './tiles/ItemTileBasicContent';

import { COLORS } from '@/constants/colors';
import {
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
  TIME_TO_EXPIRATION_DEFAULT,
} from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { tileContainerStyles } from '@/constants/styles';
import {
  currentInventoryLocationIdSelector,
  currentInventoryLocationItemsSelector,
  currentInventoryLocationSelector,
  itemsListItemSelector,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import {
  addInventoryItemsThunk,
  deleteInventoryItemsThunk,
  deleteMostRecentInventoryItemThunk,
  moveInventoryItemsThunk,
  saveItem,
} from '@/state/thunks';
import { Item } from '@/types/Item';
import { InventoryItemWithItemDetails } from '@/types/inventory';
import { ListName } from '@/types/listSlice';
import { getExpirationDatesQuantity } from '@/utils/getExpirationDatesQuantity';
import { getMostRecentExpirationDates } from '@/utils/getMostRecentExpirationDates';
import {
  getDurationInMilliseconds,
  getKeyToUse,
  getSortOrderValues,
} from '@/utils/helpers';
import { getItem } from '@/utils/model-mappings';

type CurrentInventoryLocationItem = {
  name: string;
  inventoryItemId: string;
} & InventoryItemWithItemDetails;

enum UpcModalTitle {
  AddViaUpc = 'Add via UPC',
  RemoveMostRecent = 'Remove Most Recent via UPC',
  None = EMPTY_STRING,
}

const QUANTITY_MODAL_ITEM_INITIAL = null;
export function CurrentInventoryLocationItems() {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const navigation = useNavigation();
  const inventoryLocationItems = useAppSelector(
    currentInventoryLocationItemsSelector,
  );
  const currentInventoryLocation = useAppSelector(
    currentInventoryLocationSelector,
  );
  const currentInventoryLocationId = useAppSelector(
    currentInventoryLocationIdSelector,
  );
  const [quantityModalItem, setQuantityModalItem] =
    useState<CurrentInventoryLocationItem | null>(null);
  const [barcodeScannedButNotFound, setBarcodeScannedButNotFound] =
    useState(EMPTY_STRING);
  const [upcModalTitle, setUpcModalTitle] = useState<UpcModalTitle>(
    UpcModalTitle.None,
  );
  const [confirmModalProps, setConfirmationModalProps] =
    useState<ConfirmModalProps>({
      isVisible: false,
    });
  const shouldOverrideMinimumAlertRef = useRef(false);
  const itemFormSheetRef = useRef<BottomSheetModalMethods>(null);
  const itemFormSheetItemRef = useRef<Item | null>(null);
  const barcodeItem = useAppSelector(
    itemsListItemSelector(barcodeScannedButNotFound),
  );
  const { upcProduct } = useUpcProduct({
    upc: barcodeScannedButNotFound,
    shouldSkip: !barcodeScannedButNotFound || !!barcodeItem,
  });
  const [transferItemModalProps, setTransferItemModalProps] =
    useState<AddItemToInventoryModalProps>({
      modalProps: { isVisible: false, title: EMPTY_STRING },
    });

  const itemsAsArray = useMemo(
    () =>
      Array.isArray(inventoryLocationItems)
        ? inventoryLocationItems
        : Object.entries(inventoryLocationItems).map((inventoryItem) => {
            return {
              ...inventoryItem[1],
              name: inventoryItem[1].item?.name || EMPTY_STRING,
              upc: inventoryItem[1].item?.upc || EMPTY_STRING,
              quantity: getExpirationDatesQuantity(
                inventoryItem[1].expirationDates,
              ),
              inventoryItemId: inventoryItem[0],
            };
          }),
    [inventoryLocationItems],
  ) as CurrentInventoryLocationItem[];
  const [itemsListToDisplay, setItemsListToDisplay] = useState(itemsAsArray);
  const barcodeTitleRef = useRef<BottomSheetModalMethods>(null);
  const barcodeInputRef = useRef<BottomSheetModalMethods>(null);

  const closeQuantityModal = useCallback(() => {
    setQuantityModalItem(QUANTITY_MODAL_ITEM_INITIAL);
  }, []);

  //todo: finish this
  const onAddedItemModifiedQuantityModalPress = useCallback(
    (item: Item) => {
      setQuantityModalItem(
        itemsListToDisplay.find(
          (itemToDisplay) =>
            getKeyToUse(itemToDisplay?.item || EMPTY_STRING) ===
            getKeyToUse(item),
        ) || null,
      );
      toast.closeAll();
    },
    [toast, itemsListToDisplay],
  );

  const onOpenItemBottomSheetPress = useCallback(() => {
    toast.closeAll();
    itemFormSheetRef.current?.present();
  }, [toast, itemFormSheetRef]);

  const displayItemAddedToast = useCallback(
    (item: Item) => {
      if (!item) return;
      !toast.isActive('item-added') &&
        toast.show({
          id: 'item-added',
          title: 'Item Added',
          variant: 'solid',
          backgroundColor: theme.colors.success[900],
          placement: 'bottom',
          duration: 3000,
          render: () => {
            return (
              <Stack
                bg={theme.colors.warning[900]}
                borderRadius="md"
                p={4}
                mb={4}
              >
                <Button
                  onPress={() => onAddedItemModifiedQuantityModalPress(item)}
                  variant="unstyled"
                >
                  <Text color={theme.colors.white}>
                    '{item.name || item.upc}' added to inventory. Press here to
                    modify the quantity.
                  </Text>
                </Button>
              </Stack>
            );
          },
        });
    },
    [toast, theme],
  );

  const displayNotFoundToast = useCallback(() => {
    !toast.isActive('not-found') &&
      toast.show({
        id: 'not-found',
        title: 'Not Found',
        description: `Unable to get the details of item with UPC of '${barcodeScannedButNotFound}'.  Please try again.`,
        variant: 'solid',
        backgroundColor: theme.colors.danger[900],
        placement: 'bottom',
        duration: 3000,
      });
  }, [barcodeScannedButNotFound, toast, theme]);

  const displayNoInventoryLocationToast = useCallback(() => {
    !toast.isActive('error-on-onAddViaUpcPress') &&
      toast.show({
        id: 'error-on-onAddViaUpcPress',
        colorScheme: 'danger',
        description: 'Please add an inventory location first.',
        title: 'No Inventory Location',
      });
  }, [toast]);

  const displayUpcFoundToast = useCallback(
    (item: Item) => {
      if (!item) return;
      itemFormSheetItemRef.current = item;
      !toast.isActive('upc-product-found') &&
        toast.show({
          id: 'upc-product-found',
          title: 'UPC Product Found',
          variant: 'solid',
          backgroundColor: theme.colors.success[900],
          placement: 'bottom',
          duration: 5000,
          render: () => {
            return (
              <Stack
                bg={theme.colors.warning[900]}
                borderRadius="md"
                p={4}
                mb={4}
              >
                <Button onPress={onOpenItemBottomSheetPress} variant="unstyled">
                  <Text color={theme.colors.white}>
                    {`'${item?.name || item.upc}' added to items list.  Press here to modify the item.`}
                  </Text>
                </Button>
              </Stack>
            );
          },
        });
    },
    [toast, theme, onOpenItemBottomSheetPress],
  );

  const onDeleteAllPress = useCallback(
    (item: CurrentInventoryLocationItem) => {
      shouldOverrideMinimumAlertRef.current = true;
      setConfirmationModalProps({
        isVisible: true,
        title: `Delete all inventory items?`,
        message: `This will delete all inventory items for '${item.item?.name}' in the current location.`,
        confirmButton: {
          text: 'Delete',
          colorScheme: 'danger',
        },
        cancelButton: {
          text: 'Cancel',
          colorScheme: 'success',
        },
        onConfirm: () => {
          dispatch(
            deleteInventoryItemsThunk([
              {
                itemId: item.inventoryItemId,
                locationId: currentInventoryLocationId,
                expirationDates: item.expirationDates,
              },
            ]),
          );
          setConfirmationModalProps({ isVisible: false });
        },
        onCancel: () => {
          setConfirmationModalProps({ isVisible: false });
        },
      });
    },
    [dispatch, currentInventoryLocationId, shouldOverrideMinimumAlertRef],
  );

  const onBarcodeScanned = useCallback(
    (barcode: string, isTitle = true) => {
      barcodeTitleRef.current?.dismiss();
      barcodeInputRef.current?.dismiss();

      const itemFound = itemsAsArray?.find(
        (item) => item.item?.upc === barcode,
      );

      if (!itemFound) {
        if (upcModalTitle === UpcModalTitle.AddViaUpc) {
          setBarcodeScannedButNotFound(barcode);
        } else if (upcModalTitle === UpcModalTitle.RemoveMostRecent) {
          !toast.isActive('error-on-remove-most-recent') &&
            toast.show({
              id: 'error-on-remove-most-recent',
              title: 'Inventory Item Not Found',
              description: `Unable to remove inventory for item with UPC of '${barcode}'.`,
              variant: 'solid',
              backgroundColor: theme.colors.danger[900],
              placement: 'bottom',
              duration: 3000,
            });
        }
        return;
      }

      if (!isTitle) {
        //@ts-ignore
        navigation.navigate(Routes.InventoryScreenItem, {
          itemId: itemFound?.item?._id || EMPTY_STRING,
          inventoryItemId: itemFound?.inventoryItemId || EMPTY_STRING,
          locationId: currentInventoryLocationId || EMPTY_STRING,
        });
      } else if (upcModalTitle === UpcModalTitle.AddViaUpc) {
        dispatch(
          addInventoryItemsThunk([
            {
              item: {
                expirationDates: {
                  [Date.now() +
                  (itemFound?.item?.timeToExpiration ||
                    getDurationInMilliseconds())]: 1,
                },
              },
              itemId: itemFound?.item?._id || EMPTY_STRING,
              locationId: currentInventoryLocationId || EMPTY_STRING,
            },
          ]),
        );
      } else if (upcModalTitle === UpcModalTitle.RemoveMostRecent) {
        dispatch(
          deleteMostRecentInventoryItemThunk({
            itemId: itemFound?.item?._id || EMPTY_STRING,
            locationId: currentInventoryLocationId || EMPTY_STRING,
          }),
        );
      }
    },
    [
      barcodeInputRef,
      barcodeTitleRef,
      currentInventoryLocationId,
      dispatch,
      itemsAsArray,
      navigation,
      theme,
      toast,
      upcModalTitle,
    ],
  );

  const onBarcodeInputPress = useCallback(() => {
    barcodeInputRef.current?.present();
  }, []);

  const onBarcodeTitlePress = useCallback(() => {
    barcodeTitleRef.current?.present();
  }, []);

  const onAddViaUpcPress = useCallback(() => {
    if (!currentInventoryLocationId) {
      displayNoInventoryLocationToast();
      return;
    }
    barcodeTitleRef.current?.present();
    barcodeInputRef.current?.dismiss();
    setUpcModalTitle(UpcModalTitle.AddViaUpc);
  }, [currentInventoryLocationId, displayNoInventoryLocationToast]);

  const onRemoveMostRecentPress = useCallback(() => {
    if (!currentInventoryLocationId) {
      displayNoInventoryLocationToast();
      return;
    }
    barcodeTitleRef.current?.present();
    barcodeInputRef.current?.dismiss();
    setUpcModalTitle(UpcModalTitle.RemoveMostRecent);
  }, [currentInventoryLocationId, displayNoInventoryLocationToast]);

  const onItemPress = useCallback(
    (item: CurrentInventoryLocationItem) => {
      // @ts-ignore
      navigation.navigate(Routes.InventoryScreenItem, {
        itemId: item?.item?._id || EMPTY_STRING,
        inventoryItemId: item?.inventoryItemId || EMPTY_STRING,
        locationId: currentInventoryLocationId || EMPTY_STRING,
      });
    },
    [currentInventoryLocationId, navigation],
  );

  const resetTransferModalItemProps = useCallback(() => {
    setTransferItemModalProps({
      modalProps: { isVisible: false, title: 'Transfer Item' },
    });
  }, []);

  const onTransferPress = useCallback(
    (item: CurrentInventoryLocationItem) => {
      if (!item) return;
      setTransferItemModalProps({
        modalProps: {
          isVisible: true,
          title: `Transfer '${item.item?.name}'`,
        },
        numberInputProps: {
          isVisible: false,
        },
        locationInputProps: {
          title: 'Select a Destination Location',
        },
        onCancel: resetTransferModalItemProps,
        onConfirm: (values) => {
          resetTransferModalItemProps();
          dispatch(
            moveInventoryItemsThunk([
              {
                itemId: item.item?._id || EMPTY_STRING,
                targetLocationId: getKeyToUse(values?.location || EMPTY_STRING),
              },
            ]),
          );
        },
      });
    },
    [currentInventoryLocationId, displayNoInventoryLocationToast],
  );

  const onCofirmPress = useCallback(
    (quantity: string) => {
      try {
        const parsedQuantity = parseInt(quantity, 10);
        if (isNaN(parsedQuantity) || parsedQuantity < 0) return;
        const currentItem = quantityModalItem;
        if (!currentItem) {
          throw new Error(
            `No current item found with the index of ${quantityModalItem}`,
          );
        }

        const currentItemExpirationDates = { ...currentItem?.expirationDates };
        const currentQuantity = getExpirationDatesQuantity(
          currentItemExpirationDates,
        );

        if (parsedQuantity < currentQuantity) {
          dispatch(
            deleteInventoryItemsThunk([
              {
                expirationDates: getMostRecentExpirationDates(
                  currentItemExpirationDates,
                  Math.abs(parsedQuantity - currentQuantity),
                ),
                itemId: currentItem.item?._id || EMPTY_STRING,
                locationId: currentInventoryLocationId,
              },
            ]),
          );
        } else if (parsedQuantity > currentQuantity) {
          dispatch(
            addInventoryItemsThunk([
              {
                item: {
                  expirationDates: {
                    [Date.now() +
                    (currentItem.item?.timeToExpiration ||
                      getDurationInMilliseconds())]:
                      parsedQuantity - currentQuantity,
                  },
                },
                itemId: currentItem.item?._id || EMPTY_STRING,
                locationId: currentInventoryLocationId,
              },
            ]),
          );
        }
      } catch (error) {
        toast.show({
          id: 'error-on-confirm',
          title: 'Error on Confirm',
          description: (error as Error)?.message || 'Error on Confirm',
          variant: 'solid',
          backgroundColor: theme.colors.danger[900],
          placement: 'bottom',
          duration: 3000,
        });
      } finally {
        closeQuantityModal();
      }
    },
    [closeQuantityModal, quantityModalItem, itemsListToDisplay],
  );

  useMenu({
    navigationOptionsGetter: (menuRef) => ({
      headerTitle: currentInventoryLocation?.name
        ? `Inventory for '${currentInventoryLocation?.name}'`
        : `Inventory Management`,
      headerLeft: () => <AddButton onPress={onAddViaUpcPress} />,
      headerRight: () => <RemoveButton onPress={onRemoveMostRecentPress} />,
    }),
  });

  useEffect(() => {
    if (confirmModalProps.isVisible) return;
    shouldOverrideMinimumAlertRef.current = false;
  }, [confirmModalProps.isVisible]);

  const handleSaveAndAdd = useCallback(
    async (item: Item) => {
      try {
        await dispatch(
          saveItem({
            item,
            hasKeyChanged: true,
            originalKey: {
              upc: item.upc || EMPTY_STRING,
              name: item.name || EMPTY_STRING,
            },
          }),
        ).unwrap(); // wait until saveItem completes

        await dispatch(
          addInventoryItemsThunk([
            {
              item: {
                expirationDates: {
                  [Date.now() +
                  (item.timeToExpiration || TIME_TO_EXPIRATION_DEFAULT)]: 1,
                },
              },
              itemId: item._id || EMPTY_STRING,
            },
          ]),
        ).unwrap(); // then dispatch addInventoryItemsThunk
        displayUpcFoundToast(item);
      } catch (error) {
        // Handle any error that occurred in one of the thunks
        console.error(error);
      }
    },
    [dispatch, displayUpcFoundToast],
  );

  useEffect(() => {
    if (!barcodeScannedButNotFound || (!barcodeItem && !upcProduct)) {
      return;
    } else if (barcodeScannedButNotFound && !barcodeItem && !upcProduct) {
      displayNotFoundToast();
    }
    setBarcodeScannedButNotFound(EMPTY_STRING);
    if (barcodeItem) {
      dispatch(
        addInventoryItemsThunk([
          {
            item: {
              expirationDates: {
                [Date.now() +
                (barcodeItem.timeToExpiration || TIME_TO_EXPIRATION_DEFAULT)]:
                  1,
              },
            },
            itemId: barcodeItem._id || EMPTY_STRING,
          },
        ]),
      );
      displayItemAddedToast(barcodeItem);
    } else if (upcProduct) {
      handleSaveAndAdd(
        getItem({
          upcProduct,
        }),
      );
    }
    //todo:
  }, [
    currentInventoryLocationId,
    barcodeScannedButNotFound,
    barcodeItem,
    upcProduct,
    handleSaveAndAdd,
    displayItemAddedToast,
    displayNotFoundToast,
    toast,
  ]);

  if (!itemsListToDisplay) {
    return (
      <Center flex={1} p={theme.space[3]}>
        <ActivityIndicator size="large" color={COLORS.light.text} />
      </Center>
    );
  }
  return (
    <>
      <ConfirmModal {...confirmModalProps} />
      <MinimumInventoryManager
        shouldOverrideRef={shouldOverrideMinimumAlertRef}
      />
      <ItemFormSheet
        ref={itemFormSheetRef}
        item={itemFormSheetItemRef.current || undefined}
        title={`Modify '${itemFormSheetItemRef.current?.name || itemFormSheetItemRef.current?.upc}'`}
      />
      <BarcodeScannerModal
        ref={barcodeTitleRef}
        onPress={onBarcodeTitlePress}
        isUpcIconVisible={false}
        onScannedValue={onBarcodeScanned}
        size={theme.sizes[10]}
        style={{
          marginTop: theme.space[2],
          marginRight: theme.space[2],
        }}
        title={upcModalTitle}
      />
      <FilterListInput
        list={itemsAsArray}
        onFilterChange={(list) => {
          setItemsListToDisplay(list);
        }}
        sortTypes={[SortType.Name, SortType.Upc, SortType.Quantity]}
        startingSortOrderValue={getSortOrderValues(ListName.InventoryList)}
      >
        <BarcodeScannerModal
          ref={barcodeInputRef}
          onPress={onBarcodeInputPress}
          onScannedValue={(scannedValue) =>
            onBarcodeScanned(scannedValue, false)
          }
          size={theme.sizes[7]}
          style={{
            marginTop: theme.space[2],
            marginRight: theme.space[2],
          }}
          title="Find Inventory"
        />
      </FilterListInput>
      <AddItemToInventoryModal {...transferItemModalProps} />
      <QuantityModifierModal
        title={`Quantity for ${quantityModalItem?.item?.name}`}
        minimumQuantity={0}
        initialQuantity={getExpirationDatesQuantity(
          quantityModalItem?.expirationDates,
        )}
        isVisible={!!quantityModalItem}
        onConfirm={onCofirmPress}
        onCancel={closeQuantityModal}
        onBlurPress={closeQuantityModal}
        cancelButton={{
          text: 'Cancel',
        }}
        confirmButton={{
          text: 'Update',
        }}
      />
      <FlashList
        estimatedItemSize={60}
        keyboardShouldPersistTaps="always"
        data={itemsListToDisplay}
        keyExtractor={(item, index) => index.toString()}
        ItemSeparatorComponent={() => <ListItemSeparator />}
        ListEmptyComponent={
          <Box p={theme.space[3]}>
            <Text>
              {currentInventoryLocation?.name
                ? `No inventory items have been created yet for '${currentInventoryLocation?.name}'.  To create one, open the menu in the upper right and select a menu item for adding items.`
                : 'No inventory locations have been created.  Press the plus in the upper right corner to create one.'}
            </Text>
          </Box>
        }
        renderItem={({ item, index }) => {
          return (
            <SwipeableRow
              key={item.inventoryItemId}
              leftSwipe={{
                title: 'Delete All',
                onPress: () => onDeleteAllPress(item),
                backgroundColor: theme.colors.danger[900],
              }}
              rightSwipe={{
                title: 'Transfer',
                onPress: () => onTransferPress(item),
                backgroundColor: theme.colors.primary[900],
              }}
            >
              <RectButton
                style={styles.rectButton}
                onPress={() => onItemPress(item)}
                onLongPress={() => {
                  setQuantityModalItem(item);
                }}
              >
                <Row
                  p={theme.space[FORM_INTER_ITEM_SPACING]}
                  space={theme.space[FORM_INTER_ITEM_SPACING]}
                >
                  {item.item?.images ? (
                    <ItemTileBasicContent
                      item={item.item}
                      isMultiSelectMode={false}
                      isSelected={false}
                      showDeveloperInfo={false}
                    >
                      <Row justifyContent="space-between" alignItems="center">
                        <Text>
                          <Text>Quantity:&nbsp;</Text>
                          <Text fontWeight={900}>
                            {getExpirationDatesQuantity(
                              item.expirationDates || EMPTY_STRING,
                            )}
                          </Text>
                        </Text>
                      </Row>
                    </ItemTileBasicContent>
                  ) : (
                    <Text>No Item Found for {item.inventoryItemId}</Text>
                  )}
                </Row>
              </RectButton>
            </SwipeableRow>
          );
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  rectButton: {
    ...tileContainerStyles,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  rectButtonInner: {
    ...tileContainerStyles,
  },
});
