import { Picker } from '@react-native-picker/picker';
import { Row, Input, theme, View, Stack, Heading, Text } from 'native-base';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  EMPTY_NUMBER,
  FREQUENCY_INITIAL,
  TIME_SPAN_TO_MILLISECONDS_MAPPING,
} from '@/constants/general';
import {
  Frequency,
  SpacingProp,
  HeadingTagProp,
  TimeSpan,
} from '@/types/general';

type FrequencyInputProps = {
  initialFrequency?: Frequency;
  onValueChange: (frequencyInMs: number) => void;
} & SpacingProp &
  HeadingTagProp;

export function FrequencyInput(props: FrequencyInputProps) {
  const {
    onValueChange,
    headingTag: Tag = Heading,
    spacing,
    initialFrequency,
  } = props;
  const previousFrequencyValueRef = useRef(EMPTY_NUMBER);
  const [frequency, setFrequency] = useState<Frequency>(
    initialFrequency || {
      ...FREQUENCY_INITIAL,
    },
  );
  const frequencyInMs = useMemo(
    () =>
      frequency.number *
      TIME_SPAN_TO_MILLISECONDS_MAPPING?.[frequency.timeSpan],
    [frequency],
  );

  const onChangeFrequencyNumber = useCallback(
    (newText: string) => {
      setFrequency({ ...frequency, number: Number(newText) });
    },
    [frequency],
  );

  const onChangeFrequencyTimespan = useCallback(
    (itemValue: TimeSpan) => {
      setFrequency({ ...frequency, timeSpan: itemValue });
    },
    [frequency],
  );

  useEffect(() => {
    if (frequencyInMs === previousFrequencyValueRef.current) return;
    onValueChange && onValueChange(frequencyInMs);
    previousFrequencyValueRef.current = frequencyInMs;
  }, [onValueChange, frequencyInMs]);

  return (
    <Stack my={spacing}>
      <Tag>Frequency</Tag>
      <Row>
        <Input
          keyboardType="numeric"
          variant="outline"
          p={theme.space[1]}
          placeholder="Number"
          value={frequency.number?.toString()}
          onChangeText={onChangeFrequencyNumber}
          isInvalid={frequency.number <= 0}
          flex={1}
        />
        <View flex={4}>
          <Picker
            selectedValue={frequency.timeSpan}
            onValueChange={onChangeFrequencyTimespan}
          >
            {Object.keys(TIME_SPAN_TO_MILLISECONDS_MAPPING).map((timespan) => (
              <Picker.Item
                key={timespan}
                label={`${timespan}${frequency?.number > 1 ? 's' : ''}`}
                value={timespan}
              />
            ))}
          </Picker>
        </View>
      </Row>
      {frequencyInMs ? (
        <Text fontSize={theme.sizes[3]}>
          Next expected purchase time:&nbsp;
          <Text fontWeight="bold">
            {new Date(Date.now() + frequencyInMs).toLocaleString()}
          </Text>
        </Text>
      ) : null}
    </Stack>
  );
}
