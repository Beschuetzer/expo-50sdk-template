import {
  Button,
  ButtonText,
  HStack,
  Input,
  InputField,
  VStack,
} from '@gluestack-ui/themed';
import _ from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import CheckboxInput from './CheckboxInput';
import { DurationInput } from './DurationInput';
import { InputText } from './InputText';
import { SelectInput } from './SelectInput';
import { ThumbnailPicker } from './ThumbnailPicker';
import { AbsolutePositionedScreen } from '../AbsolutelyPositionedScreen';
import { InputValidationMessage } from '../InputValidationMessage';
import { ScannerModal } from '../modals/ScannerModal';

import {
  AUTO_SAVE_DEBOUNCE_THRESHOLD,
  DEFAULT_IMAGE_INDEX,
  EMPTY_STRING,
  TASK_PRIORITY_INITIAL,
} from '@/constants/general';
import { Task, TaskPriority } from '@/types/Task';
import { TaskFormProps } from '@/types/taskForm';
import {
  getDurationValue,
  getEmptyTask,
  getId,
  getKeyToUse,
  getTaskForImport,
  getTaskValidation,
  sanitize,
} from '@/utils/helpers';

const PRIORITY_OPTIONS = Object.values(TaskPriority).map((priority) => ({
  label: priority,
  value: priority,
}));

function getIsProposedTaskAlreadyPresent(
  tasks: Task[] | undefined,
  task: Task | null | undefined,
  formData: { _id: string; title: string; code: string },
) {
  if (!tasks || tasks.length === 0) return false;
  const existing = getTaskForImport(
    formData._id || formData.code || formData.title,
    tasks,
  );
  if (!existing) return false;
  return !task || existing._id !== task._id;
}

export function TaskForm(props: TaskFormProps) {
  const {
    autoSave = false,
    autoSaveDebounce = AUTO_SAVE_DEBOUNCE_THRESHOLD,
    canOverrideTask,
    onClose,
    onSave,
    task,
    tasks,
  } = props;

  const taskToUse = useMemo(() => ({ ...(task || getEmptyTask()) }), [task]);

  const [formData, setFormData] = useState({
    _id: taskToUse._id || getId(),
    title: taskToUse.title || EMPTY_STRING,
    code: taskToUse.code || EMPTY_STRING,
    notes: taskToUse.notes || EMPTY_STRING,
  });
  const [showOverrideMsg, setShowOverrideMsg] = useState(false);
  const priorityRef = useRef<TaskPriority>(
    taskToUse.priority || TASK_PRIORITY_INITIAL,
  );
  const isCompletedRef = useRef<boolean>(taskToUse.isCompleted || false);
  const dueDateInMsRef = useRef<number>(
    taskToUse.dueDate ? taskToUse.dueDate - Date.now() : -1,
  );
  const imagesToSaveRef = useRef<string[]>(taskToUse.images || []);
  const initialImages = useMemo(() => taskToUse.images || [], [taskToUse]);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const formValidation = useMemo(() => getTaskValidation(formData), [formData]);
  const isProposedTaskAlreadyPresent = useMemo(
    () => getIsProposedTaskAlreadyPresent(tasks, task, formData),
    [tasks, task, formData],
  );
  const isSavingDisabled = useMemo(
    () =>
      !formValidation.isValid ||
      (!canOverrideTask && isProposedTaskAlreadyPresent),
    [formValidation.isValid, canOverrideTask, isProposedTaskAlreadyPresent],
  );

  const onClosePress = useCallback(() => {
    onClose && onClose();
  }, [onClose]);

  const onSavePress = useCallback(
    (shouldClose = true) => {
      const now = Date.now();
      const foundIndex = imagesToSaveRef.current.findIndex(
        (image) => image === taskToUse.images?.[taskToUse.imageToUseIndex],
      );
      const taskToSave: Task = {
        ...taskToUse,
        ...formData,
        priority: priorityRef.current,
        isCompleted: isCompletedRef.current,
        dueDate: dueDateInMsRef.current > 0 ? now + dueDateInMsRef.current : 0,
        images: imagesToSaveRef.current,
        imageToUseIndex: foundIndex >= 0 ? foundIndex : DEFAULT_IMAGE_INDEX,
        addedDate: taskToUse.addedDate || now,
        lastUpdatedDate: now,
        needsSaving: true,
      };

      if (!_.isEqual(taskToSave, task)) {
        taskToSave.needsSaving = true;
      }

      onSave && onSave(taskToSave);
      shouldClose && onClose && onClose();
    },
    [formData, onClose, onSave, task, taskToUse],
  );

  const handleAutoSave = useCallback(() => {
    clearTimeout(autoSaveTimeoutRef.current);
    if (!autoSave || isSavingDisabled) return;

    autoSaveTimeoutRef.current = setTimeout(() => {
      onSavePress(false);
    }, autoSaveDebounce);
  }, [autoSave, isSavingDisabled, autoSaveDebounce, onSavePress]);

  useEffect(() => {
    handleAutoSave();
    return () => clearTimeout(autoSaveTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const contentJSX = (
    <>
      <VStack mt="$2">
        <InputText>Title</InputText>
        <Input variant="outline" isInvalid={formData.title.length <= 0}>
          <InputField
            placeholder="Task title"
            value={formData.title}
            onChangeText={(newText) => {
              setFormData((current) => ({
                ...current,
                title: sanitize(newText),
              }));
              setShowOverrideMsg(true);
            }}
          />
        </Input>
      </VStack>
      <VStack mt="$2">
        <InputText>Code</InputText>
        <HStack space="sm" alignItems="center">
          <Input flex={1} variant="outline">
            <InputField
              placeholder="Scanned barcode/QR value"
              value={formData.code}
              onChangeText={(newText) => {
                setFormData((current) => ({ ...current, code: newText }));
                setShowOverrideMsg(true);
              }}
            />
          </Input>
          <ScannerModal
            onScannedValue={(code) =>
              setFormData((current) => ({ ...current, code }))
            }
          />
        </HStack>
      </VStack>
      <VStack mt="$2">
        <InputText>Notes</InputText>
        <Input variant="outline">
          <InputField
            multiline
            placeholder="Additional notes"
            value={formData.notes}
            onChangeText={(newText) =>
              setFormData((current) => ({ ...current, notes: newText }))
            }
          />
        </Input>
      </VStack>
      <VStack mt="$2">
        <InputText>Image</InputText>
        <ThumbnailPicker
          spacing="$2"
          selectedIndex={taskToUse.imageToUseIndex}
          initialImages={initialImages}
          onChange={(images) => {
            imagesToSaveRef.current = images;
            handleAutoSave();
          }}
        />
      </VStack>
      <VStack mt="$2">
        <SelectInput
          title="Priority"
          headingTag={InputText}
          initialValue={priorityRef.current}
          options={PRIORITY_OPTIONS}
          onValueChange={(newValue) => {
            priorityRef.current = newValue as TaskPriority;
            handleAutoSave();
          }}
        />
      </VStack>
      <DurationInput
        title="Due In"
        headingTag={InputText}
        spacing="$2"
        initialDuration={getDurationValue(
          dueDateInMsRef.current > 0 ? dueDateInMsRef.current : undefined,
        )}
        onValueChange={(newValue) => {
          dueDateInMsRef.current = newValue;
          handleAutoSave();
        }}
      />
      <CheckboxInput
        initialValue={isCompletedRef.current}
        label="Completed"
        onValueChange={(newValue) => {
          isCompletedRef.current = newValue;
          handleAutoSave();
        }}
        rowProps={{ mt: '$4' }}
      />
    </>
  );

  return (
    <AbsolutePositionedScreen
      absolutelyPositionedJsx={
        <>
          <HStack space="sm">
            {!autoSave ? (
              <Button
                isDisabled={isSavingDisabled}
                flex={1}
                onPress={() => onSavePress()}
              >
                <ButtonText>Save</ButtonText>
              </Button>
            ) : null}
            <Button flex={1} variant="outline" onPress={onClosePress}>
              <ButtonText>Close</ButtonText>
            </Button>
          </HStack>
          <InputValidationMessage
            isValid={formValidation.isValid}
            message={formValidation.message}
          />
          <InputValidationMessage
            isValid={!showOverrideMsg || !isProposedTaskAlreadyPresent}
            message={
              canOverrideTask
                ? `A task with the key '${getKeyToUse(formData)}' is already in the list and will be overridden.`
                : `The key '${getKeyToUse(formData)}' is currently in use. Enable 'Allow Override' in the options menu if this is intentional.`
            }
          />
        </>
      }
    >
      {contentJSX}
    </AbsolutePositionedScreen>
  );
}
