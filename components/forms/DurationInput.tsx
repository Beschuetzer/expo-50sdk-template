import { Picker } from '@react-native-picker/picker';
import { theme, View, Stack, Heading, Text, Row } from 'native-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { NumberInput, NumberInputProps } from './NumberInput';

import {
  EMPTY_NUMBER,
  DURATION_INITIAL,
  TIME_SPAN_TO_MILLISECONDS_MAPPING,
  EMPTY_STRING,
} from '@/constants/general';
import { Duration, TimeSpan } from '@/types/general';

type DurationInputProps = Omit<
  NumberInputProps,
  'initialValue' | 'onPlusPress' | 'onMinusPress'
> & {
  initialDuration?: Duration;
};

export function DurationInput(props: DurationInputProps) {
  const {
    headingTag: Tag = Heading,
    initialDuration,
    onValueChange,
    spacing,
    subTitle,
    title,
  } = props;
  const previousDurationValueRef = useRef(EMPTY_NUMBER);
  const [duration, setDuration] = useState<Duration>(
    initialDuration || {
      ...DURATION_INITIAL,
    },
  );
  const frequencyInMs = useMemo(
    () =>
      duration.number * TIME_SPAN_TO_MILLISECONDS_MAPPING?.[duration.timeSpan],
    [duration],
  );

  const onChangeFrequencyTimespan = useCallback(
    (itemValue: TimeSpan) => {
      setDuration({ ...duration, timeSpan: itemValue });
    },
    [duration],
  );

  const onNumberInputValueChange = useCallback(
    (number: number) => {
      setDuration((current) => ({
        ...current,
        number,
      }));
      onValueChange && onValueChange(number);
    },
    [onValueChange],
  );

  useEffect(() => {
    if (frequencyInMs === previousDurationValueRef.current) return;
    onValueChange && onValueChange(frequencyInMs);
    previousDurationValueRef.current = frequencyInMs;
  }, [onValueChange, frequencyInMs]);

  return (
    <Stack my={spacing}>
      <Tag>{title}</Tag>
      <Row>
        <View flex={3}>
          <NumberInput
            onPlusPress={() =>
              setDuration((current) => ({
                ...current,
                number: parseInt(current.number as unknown as string, 10) + 1,
              }))
            }
            onMinusPress={() =>
              setDuration((current) => ({
                ...current,
                number: parseInt(current.number as unknown as string, 10) - 1,
              }))
            }
            isMinusDisabled={duration.number <= 1}
            initialValue={duration.number}
            {...props}
            onValueChange={onNumberInputValueChange}
            title={EMPTY_STRING}
          />
        </View>
        <View flex={10}>
          <Picker
            selectedValue={duration.timeSpan}
            onValueChange={onChangeFrequencyTimespan}
          >
            {Object.keys(TIME_SPAN_TO_MILLISECONDS_MAPPING).map((timespan) => (
              <Picker.Item
                key={timespan}
                label={`${timespan}${duration?.number > 1 ? 's' : ''}`}
                value={timespan}
              />
            ))}
          </Picker>
        </View>
      </Row>

      {frequencyInMs && subTitle ? (
        <Text fontSize={theme.sizes[3]}>
          {subTitle}&nbsp;
          <Text fontWeight="bold">
            {new Date(Date.now() + frequencyInMs).toLocaleString()}
          </Text>
        </Text>
      ) : null}
    </Stack>
  );
}
