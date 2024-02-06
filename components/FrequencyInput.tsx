import { Picker } from "@react-native-picker/picker";
import { Row, Input, theme, View, Stack, Heading, Text } from "native-base";
import { useCallback, useEffect, useMemo, useState } from "react";

import { TIME_SPAN_TO_MILLISECONDS_MAPPING } from "@/constants/general";
import { Frequency, TimeSpan } from "@/types/general";

const FREQUENCY_INITIAL = Object.freeze({
  number: 1,
  timeSpan: "Week",
} as Frequency);

type FrequencyInputProps = {
  onValueChange: (frequencyInMs: number) => void;
  /**
   *This is the component to use to render the header.
   **/
  headingTag?: any;
};
export function FrequencyInput(props: FrequencyInputProps) {
  const { onValueChange, headingTag: Tag = Heading } = props;
  const [frequency, setFrequency] = useState<Frequency>({
    ...FREQUENCY_INITIAL,
  });
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
    onValueChange && onValueChange(frequencyInMs);
  }, [onValueChange, frequency]);

  return (
    <Stack>
      <Tag>Frequency</Tag>
      <Row>
        <Input
          keyboardType="numeric"
          variant="outline"
          p={theme.space[1]}
          placeholder="Number"
          value={frequency.number.toString()}
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
                label={`${timespan}${frequency?.number > 1 ? "s" : ""}`}
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
