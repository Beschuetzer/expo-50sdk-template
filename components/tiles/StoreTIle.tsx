import { useNavigation } from 'expo-router';
import { Stack, Row, theme, Text } from 'native-base';
import { useMemo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { tileContainerStyles } from '@/constants/styles';
import { ListsState, setCurrentStoreId } from '@/state/slices/listsSlice';
import { useAppDispatch } from '@/state/store';
import { Address, StoreProp } from '@/types/general';
import { getAddressString, getKeyToUse } from '@/utils/helpers';

type StoreTileProps = {
  currentStore: StoreProp['store'];
} & StoreProp &
  Pick<ListsState, 'currentStoreId'>;

export function StoreTile(props: StoreTileProps) {
  const { currentStoreId, store } = props;
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const storeKeyToUse = useMemo(
    () => getKeyToUse(store || EMPTY_STRING),
    [store],
  );

  return (
    <RectButton
      style={styles.rectButton}
      onPress={() => {
        navigation.navigate(Routes.StoreModal, {
          store,
        });
      }}
    >
      <Stack>
        <Row
          px={theme.space[FORM_INTER_ITEM_SPACING]}
          space={theme.space[2]}
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack flex={1} justifyContent="center">
            <Text fontSize={theme.fontSizes['lg']}>{store?.name}</Text>
            {store?.addressLineTwo ? <Text>{store.addressLineTwo}</Text> : null}
            {store?.city || store?.state || store?.zipCode ? (
              <Text>{getAddressString(store as Address)}</Text>
            ) : null}
            {store?.calculatedDistance != null &&
            store?.calculatedDistance >= 0 ? (
              <Text>Estimated Distance: {store.calculatedDistance}mi.</Text>
            ) : null}
            <Text>
              Needs Saving: {store?.needsSaving === false ? 'false' : 'true'}
            </Text>
            <Text>
              Has been Saved: {store?.hasBeenSaved === true ? 'true' : 'false'}
            </Text>
            <Text>Id: {String(store?._id)}</Text>
          </Stack>
          <Stack>
            {store && currentStoreId !== storeKeyToUse ? (
              <TouchableOpacity
                onPress={() => dispatch(setCurrentStoreId(storeKeyToUse))}
              >
                <Text color={theme.colors.info[900]}>Set as Current</Text>
              </TouchableOpacity>
            ) : (
              <Text>Current</Text>
            )}
          </Stack>
        </Row>
      </Stack>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  rectButton: tileContainerStyles,
});
