import { Heading } from '@gluestack-ui/themed';
import { Picker } from '@react-native-picker/picker';
import { useCallback, useState } from 'react';

import { SpacingProp, HeadingTagProp } from '@/types/general';

export type SelectInputOption = { label: string; value: string };

export type SelectInputProps = {
  initialValue?: string;
  options: SelectInputOption[];
  onValueChange: (value: string) => void;
  title?: string;
} & SpacingProp &
  HeadingTagProp;

/**
 *A generic labeled dropdown built on `@react-native-picker/picker`. Used for the Task `priority`
 *field, but reusable anywhere a small fixed set of options needs a native picker UI.
 **/
export function SelectInput(props: SelectInputProps) {
  const {
    headingTag: Tag = Heading,
    initialValue,
    onValueChange,
    options,
    title,
  } = props;
  const [value, setValue] = useState(initialValue ?? options[0]?.value);

  const onChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      onValueChange && onValueChange(newValue);
    },
    [onValueChange],
  );

  return (
    <>
      {title ? <Tag>{title}</Tag> : null}
      <Picker selectedValue={value} onValueChange={onChange}>
        {options.map((option) => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
          />
        ))}
      </Picker>
    </>
  );
}
