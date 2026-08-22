import { FontAwesome } from '@expo/vector-icons';
import { Pressable, Row, Text, useTheme } from 'native-base';
import { useState } from 'react';

import {
  RouteLocationSearchModal,
  RouteLocationSearchModalOption,
} from '../modals/RouteLocationSearchModal';

import { EMPTY_STRING } from '@/constants/general';

export type LocationPickerFieldProps = {
  locations: string[];
  value: string;
  height?: number | string;
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  /**
   *Extra fixed options (e.g. "Not assigned", "All locations") that are
   *always shown above the searchable location list in the picker modal.
   **/
  extraOptions?: RouteLocationSearchModalOption[];
  flex?: number;
};

/**
 *A tappable field that opens a searchable {@link RouteLocationSearchModal}
 *for picking a route location. Use this instead of a plain `Select`
 *anywhere a route location needs to be chosen, so users can filter long
 *location lists by typing instead of scrolling a dropdown.
 **/
export function LocationPickerField(props: LocationPickerFieldProps) {
  const {
    locations,
    height = 16,
    value,
    onChange,
    placeholder = 'Select location',
    title = 'Select Location',
    extraOptions = [],
    flex,
  } = props;
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const displayLabel =
    extraOptions.find((option) => option.value === value)?.label ||
    value ||
    EMPTY_STRING;

  return (
    <>
      <Pressable
        flex={flex}
        onPress={() => setIsVisible(true)}
        borderWidth={1}
        borderColor={theme.colors.muted[300]}
        borderRadius={4}
        px={3}
        h={height}
        alignItems="stretch"
        justifyContent="center"
        _pressed={{ opacity: 0.6 }}
      >
        <Row alignItems="center" justifyContent="space-between">
          <Text
            fontSize="sm"
            numberOfLines={1}
            color={
              displayLabel ? theme.colors.black[700] : theme.colors.muted[400]
            }
          >
            {displayLabel || placeholder}
          </Text>
          <FontAwesome
            name="chevron-down"
            size={12}
            color={theme.colors.muted[500]}
          />
        </Row>
      </Pressable>
      <RouteLocationSearchModal
        isVisible={isVisible}
        title={title}
        locations={locations}
        selectedValue={value}
        extraOptions={extraOptions}
        onCancel={() => setIsVisible(false)}
        onConfirm={(newValue) => {
          onChange(newValue);
          setIsVisible(false);
        }}
      />
    </>
  );
}
