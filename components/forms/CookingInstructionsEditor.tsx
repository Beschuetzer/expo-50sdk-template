import { FontAwesome } from '@expo/vector-icons';
import { Input, Row, Stack, Text, useTheme } from 'native-base';
import { useCallback, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { InputText } from './InputText';
import { ThumbnailPicker } from './ThumbnailPicker';

import {
  EMPTY_STRING,
  FORM_INTER_ITEM_SPACING,
  MAX_COOKING_INSTRUCTION_IMAGES,
} from '@/constants/general';
import { CookingInstructions } from '@/types/Item';

type CookingInstructionsEditorProps = {
  value: CookingInstructions;
  onChange: (instructions: CookingInstructions) => void;
};

export function CookingInstructionsEditor(
  props: CookingInstructionsEditorProps,
) {
  const { value, onChange } = props;
  const theme = useTheme();
  const [steps, setSteps] = useState<string[]>(value?.steps ?? []);

  const updateImages = useCallback(
    (images: string[]) => {
      onChange({ ...value, images });
    },
    [value, onChange],
  );

  const addStep = useCallback(() => {
    const newSteps = [...steps, EMPTY_STRING];
    setSteps(newSteps);
    onChange({ ...value, steps: newSteps });
  }, [steps, value, onChange]);

  const updateStep = useCallback(
    (index: number, text: string) => {
      const newSteps = [...steps];
      newSteps[index] = text;
      setSteps(newSteps);
      onChange({ ...value, steps: newSteps });
    },
    [steps, value, onChange],
  );

  const deleteStep = useCallback(
    (index: number) => {
      const newSteps = steps.filter((_, i) => i !== index);
      setSteps(newSteps);
      onChange({ ...value, steps: newSteps });
    },
    [steps, value, onChange],
  );

  return (
    <Stack space={FORM_INTER_ITEM_SPACING}>
      {/* Photo */}
      <InputText>Recipe Photo</InputText>
      <ThumbnailPicker
        initialImages={value.images}
        maxCustomImages={MAX_COOKING_INSTRUCTION_IMAGES}
        onChange={updateImages}
        spacing={theme.space[FORM_INTER_ITEM_SPACING]}
      />

      {/* Steps */}
      <Row alignItems="center" justifyContent="space-between">
        <InputText>Steps</InputText>
        <TouchableOpacity onPress={addStep}>
          <FontAwesome
            name="plus-circle"
            size={22}
            color={theme.colors.primary[500]}
          />
        </TouchableOpacity>
      </Row>

      {steps.length === 0 && (
        <Text color="gray.400" fontStyle="italic" fontSize="xs">
          Tap + to add a step.
        </Text>
      )}

      {steps.map((step, index) => (
        <Row
          key={index}
          alignItems="flex-start"
          space={FORM_INTER_ITEM_SPACING}
        >
          <Text fontWeight="bold" color="gray.600" minW={5} mt={theme.space[2]}>
            {index + 1}.
          </Text>
          <Input
            flex={1}
            value={step}
            placeholder={`Step ${index + 1}`}
            onChangeText={(text) => updateStep(index, text)}
            multiline
            p={theme.space[1]}
          />
          <TouchableOpacity
            onPress={() => deleteStep(index)}
            style={{ marginTop: theme.space[2] }}
          >
            <FontAwesome
              name="trash-o"
              size={18}
              color={theme.colors.red[500]}
            />
          </TouchableOpacity>
        </Row>
      ))}
    </Stack>
  );
}
