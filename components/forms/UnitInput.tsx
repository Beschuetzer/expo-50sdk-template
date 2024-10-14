import { Picker } from '@react-native-picker/picker';
import { Input, Stack, Heading, useTheme } from 'native-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EMPTY_STRING, ITEM_UNIT_INITIAL } from '@/constants/general';
import { ItemUnit } from '@/types/Item';
import { HeadingTagProp, SpacingProp } from '@/types/general';

type UnitInputProps = {
  initialValue?: string;
  onValueChange: (unit: string) => void;
} & SpacingProp &
  HeadingTagProp;

const DEBOUNCE_DURATION = 100;
export function UnitInput(props: UnitInputProps) {
  const {
    initialValue,
    onValueChange,
    headingTag: Tag = Heading,
    spacing,
  } = props;

  const isInitialCustom = useMemo(() => {
    const units = Object.values(ItemUnit) as string[];
    return initialValue && !units.includes(initialValue);
  }, [initialValue, ItemUnit]);

  const [unit, setUnit] = useState<string>(
    isInitialCustom ? ItemUnit.Custom : initialValue || ITEM_UNIT_INITIAL,
  );
  const [customUnit, setCustomUnit] = useState(
    isInitialCustom ? initialValue : EMPTY_STRING,
  );
  const debounceRef = useRef<any>(-1);
  const customUnitRef = useRef<HTMLInputElement>(null);
  const hasComponentLoadedRef = useRef(false);
  const theme = useTheme();

  const onChangeCustomUnit = useCallback(
    (customUnitValue: string) => {
      clearTimeout(debounceRef.current);
      setCustomUnit(customUnitValue);
      debounceRef.current = setTimeout(() => {
        onValueChange && onValueChange(customUnitValue);
      }, DEBOUNCE_DURATION);
    },
    [onValueChange],
  );

  const onChangeUnit = useCallback(
    (itemValue: ItemUnit) => {
      setUnit(itemValue);
      onValueChange && onValueChange(itemValue);
    },
    [onValueChange],
  );

  /**
   *This needs to come before the use effect with no deps otherwise the custom unit field will be focused on item load
   **/
  useEffect(() => {
    if (unit === ItemUnit.Custom && hasComponentLoadedRef.current) {
      customUnitRef.current?.focus();
    }
  }, [unit]);

  useEffect(() => {
    hasComponentLoadedRef.current = true;
    onValueChange && onValueChange(initialValue || ITEM_UNIT_INITIAL);
  }, []);

  return (
    <Stack mt={spacing}>
      <Tag>Unit</Tag>
      <Picker selectedValue={unit as ItemUnit} onValueChange={onChangeUnit}>
        {Object.values(ItemUnit).map((unit) => (
          <Picker.Item key={unit} label={unit} value={unit} />
        ))}
      </Picker>
      {unit === ItemUnit.Custom ? (
        <Input
          ref={customUnitRef}
          variant="outline"
          p={theme.space[1]}
          placeholder="Custom Unit"
          value={customUnit}
          onChangeText={onChangeCustomUnit}
          isInvalid={!!customUnit && customUnit.trim().length <= 0}
          flex={1}
        />
      ) : null}
    </Stack>
  );
}
