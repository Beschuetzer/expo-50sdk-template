import { useRoute } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Center, theme, Heading, Text } from 'native-base';
import { useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { ItemForm } from '@/components/forms/ItemForm';
import { useUpcProduct } from '@/components/hooks/useUpcProduct';
import { EMPTY_STRING } from '@/constants/general';
import {
  AddItemsListItemPayload,
  ListName,
  addItemsListItem,
  currentStoreSelector,
  itemsListItemSelector,
  itemsListSelector,
} from '@/state/slices/listsSlice';
import { canOverrideItemSelector } from '@/state/slices/optionsSlice';
import { ItemWithStoreSpecificValues } from '@/types/Item';
import { UpcProduct } from '@/types/UpcResponse';
import { getKeyToUse } from '@/utils/helpers';
import { getItem } from '@/utils/model-mappings';

export default function ItemModal() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
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

  console.log({key});
  
  const { upcProduct, errorMsg } = useUpcProduct({
    upc: key?.upc,
    shouldSkip: !!itemInList,
  });
  const currentStore = useSelector(currentStoreSelector);
  const fallbackItem = useMemo(() => getItemFromUpc(upcProduct), [upcProduct]);
  const itemsList = useSelector(itemsListSelector);

  function getItemFromUpc(upcProduct: UpcProduct | null) {
    const item = getItem(upcProduct);
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
        originalKey={key}
        canOverrideItem={canOverrideItem}
        currentStore={currentStore}
        items={itemsList.data}
        item={fallbackItem as ItemWithStoreSpecificValues}
        itemInList={itemInList}
        onClose={() => navigation.canGoBack() && navigation.goBack()}
        onSave={(addItemsListItemPayload: AddItemsListItemPayload) => {
          dispatch(addItemsListItem(addItemsListItemPayload));
        }}
        showOverrideMsg={showOverrideMsg}
        shouldFocusFirstField={!itemInList}
        shouldAddQuantity={callerList === ListName.ShoppingList}
        shouldAddToCart={callerList === ListName.InCartList}
      />
    );
  }

  return renderContent();
}
