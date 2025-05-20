import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from 'expo-router';
import { FormControl, Row, Stack, Text, useTheme } from 'native-base';
import { useCallback, useMemo, useState } from 'react';
import { ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { getSorter, SortType } from './lists/sorters';
import { ConfirmModal, ConfirmModalProps } from './modals/ConfirmModal';

import { EMPTY_STRING, FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { maxWidth } from '@/constants/styles';
import {
  currentInventoryLocationIdSelector,
  currentInventoryLocationSelector,
  inventoryLocationsSelector,
  setCurrentInventoryLocationId,
} from '@/state/slices/listsSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { deleteInventoryLocationsThunk } from '@/state/thunks';
import { HeadingTagProp } from '@/types/general';
import { InventoryLocation } from '@/types/inventory';
import { getKeyToUse } from '@/utils/helpers';

const NO_LOCATION_NAME = 'No location selected';
export type InventoryManagerProps = {
  displayOnOneLine?: boolean;
  isVisible?: boolean;

  /**
   *If this is given, it will override the default onChange behavior of changing the redux state's currentLocationId.
   **/
  onChange?: (location: InventoryLocation | null) => void;
  showAdd?: boolean;
  showList?: boolean;
  showRemove?: boolean;
  showTag?: boolean;
  style?: ViewStyle;
  useAbbreviatedVerbiage?: boolean;
} & HeadingTagProp;
export function InventoryManager(props: InventoryManagerProps) {
  const {
    displayOnOneLine = false,
    isVisible = true,
    headingTag: Tag = FormControl.Label,
    onChange,
    showAdd = false,
    showList = false,
    showRemove = false,
    showTag,
    style,
    useAbbreviatedVerbiage = false,
  } = props;
  const theme = useTheme();
  const showTagToUse = useMemo(() => {
    if (showTag != null) return showTag;
    return !displayOnOneLine;
  }, [showTag, displayOnOneLine]);

  const currentInventoryLocation = useAppSelector(
    currentInventoryLocationSelector,
  );
  const currentInventoryLocationId = useAppSelector(
    currentInventoryLocationIdSelector,
  );
  const locationsList = useAppSelector(inventoryLocationsSelector);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    { isVisible: false },
  );
  const [selectedValue, setSelectedValue] = useState(
    onChange ? EMPTY_STRING : currentInventoryLocationId,
  );

  const sortedLocations = useMemo(
    () =>
      [...locationsList]
        .filter((location) => location != null)
        .sort(getSorter({ sortType: SortType.Name, isCaseSensitive: false })),
    [locationsList],
  );

  const finalLocations = useMemo(
    () => [{ name: NO_LOCATION_NAME, _id: EMPTY_STRING }, ...sortedLocations],
    [sortedLocations],
  );

  const onAddPress = useCallback(() => {
    // @ts-ignore
    navigation.navigate(Routes.InventoryLocationModal);
  }, []);

  const onChangeLocal = useCallback(
    (newId: string) => {
      setSelectedValue(newId);
      if (onChange) {
        const newLocation =
          locationsList?.find(
            (locationLocal) => getKeyToUse(locationLocal) === newId,
          ) || null;
        newLocation && onChange(newLocation);
        return;
      }

      dispatch(
        setCurrentInventoryLocationId(
          newId === NO_LOCATION_NAME ? EMPTY_STRING : newId,
        ),
      );
    },
    [onChange, dispatch],
  );

  const onRemovePress = useCallback(() => {
    setConfirmModalProps({
      isVisible: true,
      title: `Remove ${currentInventoryLocation?.name}?`,
      message: `Are you sure you want to remove the current inventory location?  This will delete all items in the current inventory location as well.`,
      onConfirm: () => {
        if (currentInventoryLocation) {
          dispatch(
            deleteInventoryLocationsThunk({
              locations: [currentInventoryLocation],
            }),
          );
        }
        setConfirmModalProps({ isVisible: false });
      },
      onCancel: () => {
        setConfirmModalProps({ isVisible: false });
      },
    });
  }, [currentInventoryLocation]);

  const showAddJsx = useMemo(
    () => (
      <TouchableOpacity
        onPress={onAddPress}
        style={{ marginRight: theme.space[FORM_INTER_ITEM_SPACING] * 4 }}
      >
        <FontAwesome size={28} name="plus" />
      </TouchableOpacity>
    ),
    [onAddPress],
  );

  const showListJsx = useMemo(
    () => (
      <Picker
        style={displayOnOneLine ? { flex: 1 } : { width: '100%' }}
        selectedValue={onChange ? selectedValue : currentInventoryLocationId}
        onValueChange={onChangeLocal}
      >
        {finalLocations.map((location) => (
          <Picker.Item
            key={getKeyToUse(location)}
            label={location.name}
            value={getKeyToUse(location)}
          />
        ))}
      </Picker>
    ),
    [
      currentInventoryLocationId,
      locationsList,
      onChangeLocal,
      displayOnOneLine,
    ],
  );

  const showRemoveJsx = useMemo(
    () => (
      <TouchableOpacity
        onPress={onRemovePress}
        style={{ marginLeft: theme.space[FORM_INTER_ITEM_SPACING] * 4 }}
      >
        <FontAwesome size={28} name="minus" />
      </TouchableOpacity>
    ),
    [onRemovePress],
  );

  const showTagJSX = useMemo(
    () => (
      <Text>
        <Tag>
          Current {useAbbreviatedVerbiage ? EMPTY_STRING : 'Location'}
          :&nbsp;
        </Tag>
        <Tag>{currentInventoryLocation?.name || 'No location selected'}</Tag>
      </Text>
    ),
    [currentInventoryLocation, Tag, useAbbreviatedVerbiage],
  );

  const ContainerTag = displayOnOneLine ? Row : Stack;

  if (!isVisible) return null;
  return (
    <>
      <ConfirmModal {...confirmModalProps} />
      <ContainerTag
        style={{
          justifyContent: displayOnOneLine ? 'flex-start' : 'center',
          alignItems: displayOnOneLine ? 'center' : 'stretch',
          paddingHorizontal: theme.space[FORM_INTER_ITEM_SPACING] * 4,
          ...style,
        }}
        flex={0}
        {...maxWidth}
      >
        {displayOnOneLine ? (
          <>
            {showAdd ? showAddJsx : null}
            {showRemove && currentInventoryLocationId ? showRemoveJsx : null}
            {showList && locationsList.length > 0 ? showListJsx : null}
            {showTagToUse ? showTagJSX : null}
          </>
        ) : (
          <>
            <Row
              {...maxWidth}
              justifyContent="space-between"
              alignItems="center"
            >
              {showTagToUse ? showTagJSX : null}
              {showAdd ? showAddJsx : null}
            </Row>
            {showList && locationsList.length > 0 ? showListJsx : null}
          </>
        )}
      </ContainerTag>
    </>
  );
}
