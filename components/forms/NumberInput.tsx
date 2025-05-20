import { Row, Input, theme, Heading } from 'native-base';
import { useCallback, useState } from 'react';

import { PlusMinusStack, PlusMinusStackProps } from '../PlusMinusStack';

import { EMPTY_NUMBER } from '@/constants/general';
import { SpacingProp, HeadingTagProp } from '@/types/general';

export type NumberInputProps = {
  initialValue?: number;
  subTitle?: string;
  title?: string;
  onValueChange: (frequencyInMs: number) => void;
} & SpacingProp &
  HeadingTagProp &
  PlusMinusStackProps;

export function NumberInput(props: NumberInputProps) {
  const {
    headingTag: Tag = Heading,
    initialValue,
    onMinusPress,
    onPlusPress,
    onValueChange,
    title,
  } = props;
  const [value, setValue] = useState<number>(initialValue || EMPTY_NUMBER);

  const onChangeValue = useCallback(
    (newText: string) => {
      const newValue = parseInt(newText, 10) || EMPTY_NUMBER;
      setValue(newValue);
      onValueChange && onValueChange(newValue);
    },
    [onValueChange],
  );

  const onMinusPressLocal = useCallback(() => {
    setValue(
      (current) => (parseInt(current as unknown as string, 10) || 1) - 1,
    );
    onMinusPress && onMinusPress();
  }, [onMinusPress]);

  const onPlusPressLocal = useCallback(() => {
    setValue(
      (current) =>
        (parseInt(current as unknown as string, 10) || EMPTY_NUMBER) + 1,
    );
    onPlusPress && onPlusPress();
  }, [onPlusPress]);

  return (
    <>
      {title ? <Tag>{title}</Tag> : null}
      <Row>
        <PlusMinusStack
          isMinusDisabled={value <= 0}
          isPlusDisabled={false}
          {...props}
          onPlusPress={onPlusPressLocal}
          onMinusPress={onMinusPressLocal}
        />
        <Input
          keyboardType="numeric"
          variant="outline"
          p={theme.space[1]}
          placeholder="Number"
          value={value.toString()}
          onChangeText={onChangeValue}
          flex={1}
        />
      </Row>
    </>
  );
}
