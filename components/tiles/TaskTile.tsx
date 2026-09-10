import { FontAwesome } from '@expo/vector-icons';
import { Box, Center, HStack, Text, VStack } from '@gluestack-ui/themed';
import { useNavigation } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { RectButton, RectButtonProps } from 'react-native-gesture-handler';

import { DeveloperInfo } from './DeveloperInfo';
import { ImageRenderer } from '../ImageRenderer';

import { FORM_INTER_ITEM_SPACING } from '@/constants/general';
import { Routes } from '@/constants/navigation';
import { Task, TaskTileViewingMode } from '@/types/Task';
import { ItemProp } from '@/types/general';

export { TaskTileViewingMode } from '@/types/Task';

export type TaskTileProps = {
  buttonProps?: RectButtonProps;
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
  onPress?: (task: Task) => void;
  onSelect?: (task: Task) => void;
  viewingMode?: TaskTileViewingMode;
} & ItemProp<Task>;

const IMAGE_HEIGHT = 46;

function TileIsSelectedBackground(props: {
  isMultiSelectMode: boolean;
  isSelected: boolean;
}) {
  const { isSelected, isMultiSelectMode } = props;
  const opacity = !isMultiSelectMode || !isSelected ? 0 : 0.25;

  return (
    <Center
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      opacity={opacity}
      bg="$success900"
      pointerEvents="none"
    />
  );
}

function TaskTileNameAndCodeColumn(props: {
  task: Task;
  children?: React.ReactNode;
}) {
  const { task, children } = props;
  if (!task) return null;
  return (
    <VStack flex={1} space="sm">
      <Text numberOfLines={1} bold>
        {task.title}
      </Text>
      {task.code ? <Text fontWeight="$900">#{task.code}</Text> : null}
      {children}
    </VStack>
  );
}

export function TaskTile(props: TaskTileProps) {
  const navigation = useNavigation();
  const {
    isSelected = false,
    isMultiSelectMode = false,
    buttonProps,
    item: task,
    onPress,
    onSelect,
    viewingMode = TaskTileViewingMode.Basic,
  } = props;

  const dueDateText = useMemo(
    () => (task?.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'),
    [task?.dueDate],
  );

  function renderContent() {
    return (
      <>
        <Box flex={0}>
          <ImageRenderer
            task={task}
            source={task.images?.[task.imageToUseIndex]}
            height={IMAGE_HEIGHT}
            width={(IMAGE_HEIGHT * 2) / 3}
            useMarginRight
          />
        </Box>
        <TaskTileNameAndCodeColumn task={task}>
          {viewingMode === TaskTileViewingMode.Full ? (
            <>
              <Text>Priority: {task.priority}</Text>
              <Text>Due: {dueDateText}</Text>
              <Text>{task.isCompleted ? 'Completed' : 'Not completed'}</Text>
            </>
          ) : null}
          <DeveloperInfo
            _id={task._id}
            hasBeenSaved={task.hasBeenSaved}
            needsSaving={task.needsSaving}
          />
        </TaskTileNameAndCodeColumn>
        {task.isCompleted ? (
          <FontAwesome name="check-circle" size={16} color="green" />
        ) : null}
        <TileIsSelectedBackground
          isMultiSelectMode={isMultiSelectMode}
          isSelected={isSelected}
        />
      </>
    );
  }

  return (
    <RectButton
      {...buttonProps}
      style={styles.rectButton}
      onPress={() => {
        onPress && onPress(task);
        if (isMultiSelectMode) {
          onSelect && onSelect(task);
        } else {
          // @ts-ignore -- expo-router v3 typed params
          navigation.navigate(Routes.TaskModal, { key: task });
        }
      }}
    >
      <HStack padding={FORM_INTER_ITEM_SPACING} space="sm">
        {renderContent()}
      </HStack>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  rectButton: {
    flex: 1,
  },
});
