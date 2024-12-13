import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from 'expo-router';
import { FormControl, Row, Stack, Text } from 'native-base';
import { useCallback } from 'react';
import { ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { EMPTY_STRING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { maxWidth } from '@/constants/styles';
import {
  currentStoreIdSelector,
  currentStoreSelector,
  listToDisplaySelector,
  setCurrentStoreId,
} from '@/state/slices/listsSlice';
import { Store } from '@/types/Store';
import { HeadingTagProp } from '@/types/general';
import { ListName } from '@/types/listSlice';
import { getKeyToUse } from '@/utils/helpers';

export type StorageManagerProps = {
  isVisible?: boolean;
  showAddStore?: boolean;
  showStoreList?: boolean;
  showTag?: boolean;
  style?: ViewStyle;
  useAbbreviatedVerbiage?: boolean;
} & HeadingTagProp;
export function StoreManager(props: StorageManagerProps) {
  const {
    isVisible = true,
    headingTag: Tag = FormControl.Label,
    showAddStore = false,
    showStoreList = false,
    showTag = true,
    style,
    useAbbreviatedVerbiage = false,
  } = props;

  const currentStore = useSelector(currentStoreSelector);
  const currentStoreId = useSelector(currentStoreIdSelector);
  const storesList = useSelector(
    listToDisplaySelector(ListName.StoresList),
  ) as Store[];
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const onAddPress = useCallback(() => {
    // @ts-ignore
    navigation.navigate(Routes.StoreModal);
  }, []);

  const onChangeStore = useCallback((storeName: string) => {
    dispatch(setCurrentStoreId(storeName));
  }, []);

  if (!isVisible) return null;
  return (
    <Stack style={style}>
      <Row {...maxWidth} justifyContent="space-between" alignItems="center">
        {showTag ? (
          <Text>
            <Tag>
              Current {useAbbreviatedVerbiage ? EMPTY_STRING : 'Store'}:&nbsp;
            </Tag>
            <Tag>
              {currentStore?.addressLineOne ||
                currentStore?.name ||
                'No store selected'}
            </Tag>
          </Text>
        ) : null}
        {showAddStore ? (
          <TouchableOpacity onPress={onAddPress}>
            <FontAwesome size={28} name="plus" />
          </TouchableOpacity>
        ) : null}
      </Row>
      {showStoreList ? (
        <Picker selectedValue={currentStoreId} onValueChange={onChangeStore}>
          {storesList.map((store) => (
            <Picker.Item
              key={getKeyToUse(store)}
              label={store?.name}
              value={getKeyToUse(store)}
            />
          ))}
        </Picker>
      ) : null}
    </Stack>
  );
}
