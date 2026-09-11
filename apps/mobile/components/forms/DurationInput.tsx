import { Box, Heading, HStack, VStack } from '@gluestack-ui/themed';
import { Picker } from '@react-native-picker/picker';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { NumberInput, NumberInputProps } from './NumberInput';

import {
  DURATION_INITIAL,
  TIME_SPAN_TO_MILLISECONDS_MAPPING,
  EMPTY_NUMBER,
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

  const onChangeTimespan = useCallback(
    (itemValue: TimeSpan) => {
      setDuration({ ...duration, timeSpan: itemValue });
    },
    [duration],
  );

  useEffect(() => {
    if (frequencyInMs === previousDurationValueRef.current) return;
    onValueChange && onValueChange(frequencyInMs);
    previousDurationValueRef.current = frequencyInMs;
  }, [onValueChange, frequencyInMs]);

  return (
    <VStack my={spacing as number}>
      {title ? <Tag>{title}</Tag> : null}
      {subTitle ? <Tag>{subTitle}</Tag> : null}
      <HStack>
        <Box flex={3}>
          <NumberInput
            onPlusPress={() =>
              setDuration((current) => ({
                ...current,
                number: Number(current.number) + 1,
              }))
            }
            onMinusPress={() =>
              setDuration((current) => ({
                ...current,
                number: Math.max(Number(current.number) - 1, 0),
              }))
            }
            initialValue={duration.number}
            onValueChange={(newNumber) =>
              setDuration((current) => ({ ...current, number: newNumber }))
            }
          />
        </Box>
        <Box flex={4}>
          <Picker
            selectedValue={duration.timeSpan}
            onValueChange={onChangeTimespan}
          >
            {Object.values(TimeSpan).map((timeSpan) => (
              <Picker.Item
                key={timeSpan}
                label={`${timeSpan}(s)`}
                value={timeSpan}
              />
            ))}
          </Picker>
        </Box>
      </HStack>
    </VStack>
  );
}
