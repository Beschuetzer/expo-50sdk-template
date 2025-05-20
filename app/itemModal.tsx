import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Center, theme, Heading, Text } from 'native-base';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { ItemForm } from '@/components/forms/ItemForm';
import { ListHeaderRight } from '@/components/header/ListHeaderRight';
import { useMenu } from '@/components/hooks/useMenu';
import { useUpcProduct } from '@/components/hooks/useUpcProduct';
import {
  AddItemToInventoryModal,
  AddItemToInventoryModalValues,
} from '@/components/modals/AddItemToInventoryModal';
import { StoreSelectionModal } from '@/components/modals/StoreSelectionModal';
import { BFF_SERVICE } from '@/components/services/BffService';
import {
  EMPTY_NUMBER,
  EMPTY_STRING,
  TIME_TO_EXPIRATION_DEFAULT,
} from '@/constants/general';
import { AMAZON_S3_REGEX, LOCAL_FILE_REGEX } from '@/constants/regexs';
import { accountSelector } from '@/state/slices/generalSlice';
import {
  copyStoreSpecificValues,
  currentStoreSelector,
  itemsListItemSelector,
  itemsListSelector,
  storeSpecificValuesMapSelector,
} from '@/state/slices/listsSlice';
import {
  autoSaveItemsSelector,
  canOverrideItemSelector,
  nameOrderTemplateSelector,
} from '@/state/slices/optionsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { addInventoryItemsThunk, saveItem } from '@/state/thunks';
import { ItemWithStoreSpecificValues, Key } from '@/types/Item';
import { UpcProduct } from '@/types/UpcResponse';
import { ItemFormOnSave } from '@/types/itemForm';
import { ListName } from '@/types/listSlice';
import {
  deleteFile,
  ensureMaxLength,
  getKeyToUse,
  getS3ObjectKey,
  getUserCredentials,
} from '@/utils/helpers';
import { getItem } from '@/utils/model-mappings';

export default function ItemModal() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const route = useRoute();
  const {
    key,
    showOverrideMsg,
    showBlank = false,
    callerList,
  } = (route.params || {}) as any;
  const keyToUse = getKeyToUse(key);
  const itemInList = useAppSelector(
    itemsListItemSelector(keyToUse || EMPTY_STRING),
  );
  const canOverrideItem = useAppSelector(canOverrideItemSelector);
  const account = useAppSelector(accountSelector);
  const currentStore = useAppSelector(currentStoreSelector);
  const autoSaveItems = useAppSelector(autoSaveItemsSelector);
  const nameOrderTemplate = useAppSelector(nameOrderTemplateSelector);
  const itemsList = useAppSelector(itemsListSelector);
  const storeSpecificValuesMap = useAppSelector(storeSpecificValuesMapSelector);

  const [isStoreSelectionModalVisible, setIsStoreSelectionModalVisible] =
    useState(false);
  const s3ImagesToDeleteOnSaveRef = useRef<string[]>([]);
  const originalKeyRef = useRef<Key>(key);
  const canSkipUseUpcProductRef = useRef(false);
  const [
    isAddItemToInventoryModalVisible,
    setIsAddItemToInventoryModalVisible,
  ] = useState(false);

  const isAutoSaveEnabled = useMemo(() => {
    return !!(autoSaveItems && (!!itemInList || !!callerList));
  }, [autoSaveItems, itemInList, callerList]);

  const { upcProduct, error } = useUpcProduct({
    upc: key?.upc,
    shouldSkip: isAutoSaveEnabled
      ? !!itemInList && canSkipUseUpcProductRef.current
      : !!itemInList,
  });
  const fallbackItem = useMemo(() => getItemFromUpc(upcProduct), [upcProduct]);

  const closeAddItemToInventoryModal = useCallback(() => {
    setIsAddItemToInventoryModalVisible(false);
  }, []);

  const handleClose = useCallback(() => {
    navigation.canGoBack() && navigation.goBack();
  }, [navigation]);

  const handleImageDeletion = useCallback(
    async (url: string) => {
      const isLocalImage = url?.match(LOCAL_FILE_REGEX);
      const isS3Image = url?.match(AMAZON_S3_REGEX);
      if (isLocalImage) {
        deleteFile(url);
      } else if (isS3Image) {
        s3ImagesToDeleteOnSaveRef.current.push(url);
      }
    },
    [s3ImagesToDeleteOnSaveRef],
  );

  const handleSave = useCallback(
    (onSavePayload: ItemFormOnSave) => {
      const { hasKeyChanged, item } = onSavePayload;
      if (hasKeyChanged) {
        originalKeyRef.current = item;
      }
      canSkipUseUpcProductRef.current = onSavePayload.hasKeyChanged;
      if (s3ImagesToDeleteOnSaveRef?.current?.length > 0) {
        const objKeys = s3ImagesToDeleteOnSaveRef.current.map((s3Img) =>
          getS3ObjectKey(s3Img),
        );
        BFF_SERVICE.deleteS3Objects({
          dispatch,
          objKeys,
          ...getUserCredentials(account),
        });
      }

      dispatch(saveItem(onSavePayload));
    },
    [canSkipUseUpcProductRef, originalKeyRef],
  );

  function getItemFromUpc(upcProduct: UpcProduct | null) {
    const item = getItem({ upcProduct, nameOrderTemplate });
    if (itemInList) {
      item.images = itemInList.images;
      item.imageToUseIndex = itemInList.imageToUseIndex;
    }
    return item;
  }

  const onAddToInventoryPress = useCallback(() => {
    if (!itemInList) {
      return;
    }
    setIsAddItemToInventoryModalVisible(true);
  }, [itemInList]);

  const onAddItemToInventoryModalConfirm = useCallback(
    (values: AddItemToInventoryModalValues) => {
      if (!values?.location || !values?.number) {
        return;
      }

      const itemExpirationDate =
        Date.now() +
        (itemInList?.timeToExpiration || TIME_TO_EXPIRATION_DEFAULT);

      dispatch(
        addInventoryItemsThunk([
          {
            item: {
              expirationDates: {
                [itemExpirationDate]: values.number,
              },
            },
            locationId: getKeyToUse(values.location),
            itemId: getKeyToUse(itemInList || EMPTY_STRING),
          },
        ]),
      );
      closeAddItemToInventoryModal();
    },
    [itemInList, dispatch, closeAddItemToInventoryModal],
  );

  useMenu({
    navigationOptionsGetter: itemInList
      ? (menuRef) => ({
          headerRight: () => (
            <ListHeaderRight
              ref={menuRef}
              options={[
                itemInList
                  ? {
                      text: 'Add to Inventory',
                      onPress: onAddToInventoryPress,
                    }
                  : undefined,
                {
                  text: 'Copy Store Specific Values from ...',
                  onPress: () => {
                    setIsStoreSelectionModalVisible(true);
                  },
                },
              ]}
            />
          ),
        })
      : undefined,
  });

  function renderContent() {
    if (!itemInList && !upcProduct && !showBlank) {
      return (
        <Center height="100%">
          {error ? (
            <>
              <Heading>Error Fetching Data</Heading>
              <Text>{error.message}</Text>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={theme.colors.black} />
              <Text>Checking for Upc data...</Text>
            </>
          )}
        </Center>
      );
    }

    return (
      <>
        <ItemForm
          originalKey={originalKeyRef.current}
          canOverrideItem={canOverrideItem}
          currentStore={currentStore}
          items={itemsList.data}
          item={fallbackItem as ItemWithStoreSpecificValues}
          itemInList={itemInList}
          onClose={handleClose}
          onDeleteImage={handleImageDeletion}
          onSave={handleSave}
          showOverrideMsgInitial={showOverrideMsg}
          shouldFocusFirstField={!itemInList}
          initialQuantity={
            callerList === ListName.ShoppingList ||
            callerList === ListName.PreviouslyPurchased
              ? 1
              : EMPTY_NUMBER
          }
          shouldAddToCart={callerList === ListName.InCartList}
          autoSave={isAutoSaveEnabled}
          storeSpecificValuesMap={storeSpecificValuesMap}
        />
        <AddItemToInventoryModal
          modalProps={{
            isVisible: isAddItemToInventoryModalVisible,
            title: `Add '${itemInList?.name || 'Item'}' to Inventory`,
          }}
          onCancel={closeAddItemToInventoryModal}
          onConfirm={onAddItemToInventoryModalConfirm}
        />
        <StoreSelectionModal
          title={`Copy '${ensureMaxLength(itemInList?.name || EMPTY_STRING, 20)} values from:'`}
          isVisible={isStoreSelectionModalVisible}
          onCancel={() => setIsStoreSelectionModalVisible(false)}
          onConfirm={(selectedStore) => {
            if (selectedStore && itemInList) {
              dispatch(
                copyStoreSpecificValues({
                  items: [itemInList],
                  source: selectedStore,
                  destination: currentStore,
                }),
              );
            }
            setIsStoreSelectionModalVisible(false);
          }}
        />
      </>
    );
  }

  return renderContent();
}
