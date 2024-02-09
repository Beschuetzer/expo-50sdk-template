import { Picker } from "@react-native-picker/picker";
import { Input, Stack, Heading, useTheme } from "native-base";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  EMPTY_STRING,
} from "@/constants/general";
import { ItemUnit } from "@/types/Item";
import { SpacingProp } from "@/types/general";

const UNIT_INITIAL = ItemUnit.Package;
type UnitInputProps = {
  onValueChange: (unit: string) => void;
  /**
   *This is the component to use to render the header.
   **/
  headingTag?: any;
} & SpacingProp;

const DEBOUNCE_DURATION = 100;
export function UnitInput(props: UnitInputProps) {
  const { onValueChange, headingTag: Tag = Heading, spacing } = props;
  const [unit, setUnit] = useState<ItemUnit>(UNIT_INITIAL);
  const [customUnit, setCustomUnit] = useState(EMPTY_STRING);
  const debounceRef = useRef<any>(-1);
  const customUnitRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (unit === ItemUnit.Custom) {
      customUnitRef.current?.focus();
    }
  }, [unit]);

  useEffect(() => {
    onValueChange && onValueChange(UNIT_INITIAL);
  }, [])

  return (
    <Stack mt={spacing}>
      <Tag>Unit</Tag>
      <Picker selectedValue={unit} onValueChange={onChangeUnit}>
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
          isInvalid={customUnit.trim().length <= 0}
          flex={1}
        />
      ) : null}
    </Stack>
  );
}
