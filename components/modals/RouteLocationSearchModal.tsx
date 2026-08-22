import { FontAwesome } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Button, Center, Input, Text, View, useTheme } from 'native-base';
import { useEffect, useMemo, useState } from 'react';

import { ModalWithBlur, ModalWithBlurProps } from './ModalWithBlur';
import { ListItemSeparator } from '../lists/ListItemSeparator';

import {
  EMPTY_STRING,
  ESTIMATED_SIZE_FOR_ROUTE_LOCATION_SEARCH_MODAL,
  FORM_INTER_ITEM_SPACING,
  LIST_HAPTICS,
} from '@/constants/general';

export type RouteLocationSearchModalOption = {
  label: string;
  value: string;
};

export type RouteLocationSearchModalProps = Omit<
  ModalWithBlurProps,
  'children' | 'onConfirm' | 'confirmButton'
> & {
  /**
   *The searchable list of route locations (e.g. aisle/shelf names) to
   *choose from.
   **/
  locations: string[];
  selectedValue?: string;
  /**
   *Extra fixed options (e.g. "Not assigned", "All locations") that are
   *always shown above the searchable location list, regardless of the
   *current search text.
   **/
  extraOptions?: RouteLocationSearchModalOption[];
  onConfirm: (value: string) => void;
};

/**
 *A searchable location picker used everywhere a route location needs to be
 *selected (assigning an item's location, filtering by location, etc).
 *Tapping a row immediately confirms the selection and closes the modal.
 **/
export function RouteLocationSearchModal(props: RouteLocationSearchModalProps) {
  const {
    isVisible,
    locations,
    selectedValue,
    extraOptions = [],
    onConfirm,
    onCancel,
    title = 'Select Location',
    ...modalProps
  } = props;
  const theme = useTheme();
  const [filterValue, setFilterValue] = useState(EMPTY_STRING);

  useEffect(() => {
    if (!isVisible) setFilterValue(EMPTY_STRING);
  }, [isVisible]);

  const options = useMemo(() => {
    const needle = filterValue.trim().toLowerCase();
    const filteredLocations = needle
      ? locations.filter((location) => location.toLowerCase().includes(needle))
      : locations;
    const optionsToShow = [
      ...extraOptions,
      ...filteredLocations.map((location) => ({
        label: location,
        value: location,
      })),
    ];

    return Array.from(
      new Map(optionsToShow.map((option) => [option.value, option])).values(),
    );
  }, [extraOptions, filterValue, locations]);

  if (!isVisible) return null;

  return (
    <ModalWithBlur
      {...modalProps}
      isVisible={isVisible}
      title={title}
      onCancel={onCancel}
      confirmButton={{ isVisible: false }}
      cancelButton={{
        text: 'Close',
        colorScheme: 'muted',
        ...props.cancelButton,
      }}
      containerStyles={{
        width: '90%',
        height: '80%',
        maxWidth: '800px',
        ...props.containerStyles,
      }}
    >
      <Input
        value={filterValue}
        onChangeText={setFilterValue}
        placeholder="Search locations"
        mb={theme.space[FORM_INTER_ITEM_SPACING]}
        autoFocus
        InputRightElement={
          <View pr={theme.space[FORM_INTER_ITEM_SPACING] * 4}>
            <FontAwesome name="search" />
          </View>
        }
      />
      <View flex={1}>
        <FlashList
          keyboardShouldPersistTaps="always"
          data={options}
          keyExtractor={(option, index) =>
            `route-location-option-${index}-${option.value || 'empty'}`
          }
          estimatedItemSize={ESTIMATED_SIZE_FOR_ROUTE_LOCATION_SEARCH_MODAL}
          ItemSeparatorComponent={() => <ListItemSeparator />}
          ListEmptyComponent={
            <Center py={6}>
              <Text color={theme.colors.muted[400]} fontSize="sm">
                No locations found.
              </Text>
            </Center>
          }
          renderItem={({ item: option }) => (
            <Button
              variant={option.value === selectedValue ? 'solid' : 'ghost'}
              justifyContent="flex-start"
              onPress={() => {
                LIST_HAPTICS.handleSelection();
                onConfirm(option.value);
              }}
            >
              {option.label}
            </Button>
          )}
        />
      </View>
    </ModalWithBlur>
  );
}
