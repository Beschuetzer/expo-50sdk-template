import { FontAwesome } from '@expo/vector-icons';
import { Input, Row, Stack, Text, useTheme } from 'native-base';
import { useCallback, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';

import { InputText } from './InputText';
import { ThumbnailPicker } from './ThumbnailPicker';
import { ModalWithBlur } from '../modals/ModalWithBlur';

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
  const [moveStepIndex, setMoveStepIndex] = useState<number | null>(null);
  const [movePosition, setMovePosition] = useState('');

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

  const moveStep = useCallback(
    (index: number, direction: -1 | 1) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= steps.length) return;

      const newSteps = [...steps];
      [newSteps[index], newSteps[targetIndex]] = [
        newSteps[targetIndex],
        newSteps[index],
      ];
      setSteps(newSteps);
      onChange({ ...value, steps: newSteps });
    },
    [steps, value, onChange],
  );

  const moveStepToPosition = useCallback(() => {
    if (moveStepIndex === null) return;

    const parsedPosition = parseInt(movePosition, 10);
    if (isNaN(parsedPosition) || steps.length === 0) return;

    const targetIndex = Math.max(
      0,
      Math.min(parsedPosition - 1, steps.length - 1),
    );
    const newSteps = [...steps];
    const [stepToMove] = newSteps.splice(moveStepIndex, 1);
    newSteps.splice(targetIndex, 0, stepToMove);
    setSteps(newSteps);
    onChange({ ...value, steps: newSteps });
    setMoveStepIndex(null);
    setMovePosition('');
  }, [movePosition, moveStepIndex, onChange, steps, value]);

  const closeMoveStepModal = useCallback(() => {
    setMoveStepIndex(null);
    setMovePosition('');
  }, []);

  return (
    <>
      <Stack space={FORM_INTER_ITEM_SPACING} p={theme.space[1]}>
        {/* Photo */}
        <InputText>Recipe Photo</InputText>
        <ThumbnailPicker
          initialImages={value.images}
          maxCustomImages={MAX_COOKING_INSTRUCTION_IMAGES}
          onChange={updateImages}
          spacing={theme.space[FORM_INTER_ITEM_SPACING]}
        />

        {/* Steps */}
        <Row
          alignItems="center"
          justifyContent="space-between"
          mr={theme.space[0.5]}
          mt={theme.space[1]}
          mb={theme.space[0.5]}
        >
          <InputText>Steps</InputText>
          <TouchableOpacity onPress={addStep} accessibilityLabel="Add step">
            <FontAwesome
              name="plus-circle"
              size={22}
              color={theme.colors.primary[500]}
            />
          </TouchableOpacity>
        </Row>
      </Stack>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.space[4],
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        {steps.length === 0 && (
          <Text color="gray.400" fontStyle="italic" fontSize="xs">
            Tap + to add a step.
          </Text>
        )}
        {steps.map((step, index) => {
          const isLastStep = index === steps.length - 1;

          return (
            <Row
              key={index}
              space={FORM_INTER_ITEM_SPACING}
              alignItems="center"
              mb={theme.space[0.5]}
            >
              <Text fontWeight="bold" color="gray.600" minW={5}>
                {index + 1}.
              </Text>
              <Input
                flex={5}
                value={step}
                placeholder={`Step ${index + 1}`}
                onChangeText={(text) => updateStep(index, text)}
                multiline
                blurOnSubmit
                p={theme.space[1]}
                borderRadius={8}
                backgroundColor={theme.colors.muted[50]}
                borderColor={theme.colors.muted[200]}
                _focus={{
                  backgroundColor: theme.colors.white,
                  borderColor: theme.colors.primary[500],
                }}
              />
              <Row
                alignItems="center"
                justifyContent="space-between"
                space={2}
                flex={3}
              >
                <Stack space={1}>
                  <TouchableOpacity
                    onPress={() => moveStep(index, -1)}
                    disabled={index === 0}
                    hitSlop={6}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor:
                        index === 0
                          ? theme.colors.muted[100]
                          : theme.colors.primary[50],
                      opacity: index === 0 ? 0.35 : 1,
                    }}
                    accessibilityLabel={`Move step ${index + 1} up`}
                  >
                    <FontAwesome
                      name="chevron-up"
                      size={13}
                      color={
                        index === 0
                          ? theme.colors.muted[600]
                          : theme.colors.primary[600]
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => moveStep(index, 1)}
                    disabled={isLastStep}
                    hitSlop={6}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isLastStep
                        ? theme.colors.muted[100]
                        : theme.colors.primary[50],
                      opacity: isLastStep ? 0.35 : 1,
                    }}
                    accessibilityLabel={`Move step ${index + 1} down`}
                  >
                    <FontAwesome
                      name="chevron-down"
                      size={13}
                      color={
                        isLastStep
                          ? theme.colors.muted[600]
                          : theme.colors.primary[600]
                      }
                    />
                  </TouchableOpacity>
                </Stack>
                <TouchableOpacity
                  onPress={() => {
                    setMoveStepIndex(index);
                    setMovePosition(String(index + 1));
                  }}
                  hitSlop={6}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.primary[50],
                  }}
                  accessibilityLabel={`Move step ${index + 1} to a position`}
                >
                  <FontAwesome
                    name="arrows-v"
                    size={17}
                    color={theme.colors.primary[600]}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteStep(index)}
                  hitSlop={6}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.red[50],
                  }}
                  accessibilityLabel={`Delete step ${index + 1}`}
                >
                  <FontAwesome
                    name="trash-o"
                    size={17}
                    color={theme.colors.red[500]}
                  />
                </TouchableOpacity>
              </Row>
            </Row>
          );
        })}
      </ScrollView>
      <ModalWithBlur
        isVisible={moveStepIndex !== null}
        title="Move Step"
        onCancel={closeMoveStepModal}
        onConfirm={moveStepToPosition}
        cancelButton={{ text: 'Cancel', colorScheme: 'muted' }}
        confirmButton={{
          text: 'Move',
          isEnabled:
            movePosition.trim() !== '' && !isNaN(parseInt(movePosition, 10)),
        }}
      >
        <Text fontSize="xs" color={theme.colors.muted[500]} mb={1}>
          Move step {moveStepIndex === null ? '' : moveStepIndex + 1} to
          position (1-{steps.length})
        </Text>
        <Input
          value={movePosition}
          onChangeText={setMovePosition}
          placeholder={`1 - ${steps.length}`}
          keyboardType="numeric"
          variant="outline"
        />
      </ModalWithBlur>
    </>
  );
}
