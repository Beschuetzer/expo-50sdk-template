import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Center, theme, Heading, Text } from 'native-base';
import { useCallback, useMemo, useRef } from 'react';
import { ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';

import { ItemForm, ItemFormOnSave } from '@/components/forms/ItemForm';
import { useUpcProduct } from '@/components/hooks/useUpcProduct';
import { EMPTY_STRING } from '@/constants/general';
import {
  ListName,
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
import { useAppDispatch } from '@/state/store';
import { saveItem } from '@/state/thunks';
import { ItemWithStoreSpecificValues, Key } from '@/types/Item';
import { UpcProduct } from '@/types/UpcResponse';
import { getKeyToUse } from '@/utils/helpers';
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
  const itemInList = useSelector(
    itemsListItemSelector(keyToUse || EMPTY_STRING),
  );
  const canOverrideItem = useSelector(canOverrideItemSelector);
  const currentStore = useSelector(currentStoreSelector);
  const autoSaveItems = useSelector(autoSaveItemsSelector);
  const nameOrderTemplate = useSelector(nameOrderTemplateSelector);
  const itemsList = useSelector(itemsListSelector);
  const storeSpecificValuesMap = useSelector(storeSpecificValuesMapSelector);

  const originalKeyRef = useRef<Key>(key);
  const canSkipUseUpcProductRef = useRef(false);

  const isAutoSaveEnabled = useMemo(() => {
    return !!(autoSaveItems && (!!itemInList || !!callerList));
  }, [autoSaveItems, itemInList, callerList]);

  const { upcProduct, errorMsg } = useUpcProduct({
    upc: key?.upc,
    shouldSkip: isAutoSaveEnabled
      ? !!itemInList && canSkipUseUpcProductRef.current
      : !!itemInList,
  });
  const fallbackItem = useMemo(() => getItemFromUpc(upcProduct), [upcProduct]);

  const handleClose = useCallback(() => {
    navigation.canGoBack() && navigation.goBack();
  }, [navigation]);

  const handleSave = useCallback(
    (onSavePayload: ItemFormOnSave) => {
      const { hasKeyChanged, item } = onSavePayload;
      if (hasKeyChanged) {
        originalKeyRef.current = item;
      }
      canSkipUseUpcProductRef.current = onSavePayload.hasKeyChanged;
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

  function renderContent() {
    if (!itemInList && !upcProduct && !showBlank) {
      return (
        <Center height="100%">
          {errorMsg ? (
            <>
              <Heading>Error Fetching Data</Heading>
              <Text>{errorMsg}</Text>
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
      <ItemForm
        originalKey={originalKeyRef.current}
        canOverrideItem={canOverrideItem}
        currentStore={currentStore}
        items={itemsList.data}
        item={fallbackItem as ItemWithStoreSpecificValues}
        itemInList={itemInList}
        onClose={handleClose}
        onSave={handleSave}
        showOverrideMsgInitial={showOverrideMsg}
        shouldFocusFirstField={!itemInList}
        shouldAddQuantity={
          callerList === ListName.ShoppingList ||
          callerList === ListName.PreviouslyPurchased
        }
        shouldAddToCart={callerList === ListName.InCartList}
        autoSave={isAutoSaveEnabled}
        storeSpecificValuesMap={storeSpecificValuesMap}
      />
    );
  }

  return renderContent();
}
