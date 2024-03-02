import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from 'expo-router';
import { FormControl, Row, Stack } from 'native-base';
import { useCallback } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { EMPTY_STRING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { maxWidth } from '@/constants/styles';
import {
  ListName,
  currentStoreSelector,
  listToDisplaySelector,
  setCurrentStoreName,
} from '@/state/slices/listsSlice';
import { Store } from '@/types/Store';
import { HeadingTagProp } from '@/types/general';

type StorageManagerProps = {
  showAddStore?: boolean;
  showStoreList?: boolean;
  useAbbreviatedVerbiage?: boolean;
} & HeadingTagProp;
export function StoreManager(props: StorageManagerProps) {
  const {
    showAddStore = false,
    showStoreList = false,
    useAbbreviatedVerbiage = false,
    headingTag: Tag = FormControl.Label,
  } = props;

  const currentStore = useSelector(currentStoreSelector);
  const storesList = useSelector(
    listToDisplaySelector(ListName.StoresList),
  ) as Store[];
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const onAddPress = useCallback(() => {
    navigation.navigate(Routes.StoreModal);
  }, []);

  const onChangeStore = useCallback((storeName: string) => {
    dispatch(setCurrentStoreName(storeName));
  }, []);

  return (
    <Stack>
      <Row {...maxWidth} justifyContent="space-between" alignItems="center">
        <Tag>
          Current {useAbbreviatedVerbiage ? EMPTY_STRING : 'Store'}:{' '}
          {currentStore?.name || 'No store selected'}
        </Tag>
        {showAddStore ? (
          <TouchableOpacity onPress={onAddPress}>
            <FontAwesome size={28} name="plus" />
          </TouchableOpacity>
        ) : null}
      </Row>
      {showStoreList ? (
        <Picker
          selectedValue={currentStore?.name || EMPTY_STRING}
          onValueChange={onChangeStore}
        >
          {storesList.map((store) => (
            <Picker.Item
              key={store?.name}
              label={`${store?.name} (lat: ${store?.gpsCoordinates?.lat}, long: ${store?.gpsCoordinates?.lon})`}
              value={store?.name}
            />
          ))}
        </Picker>
      ) : null}
    </Stack>
  );
}
