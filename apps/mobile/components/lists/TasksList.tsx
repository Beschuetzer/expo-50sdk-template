import { FontAwesome } from '@expo/vector-icons';
import { Box, Text, useToast } from '@gluestack-ui/themed';
import { type NavigationProp, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';

import { ListActionToast } from './ListActionToast';
import { ListItemSeparator } from './ListItemSeparator';
import { SwipeableRow } from './SwipeableRow';
import { SortType } from './sorters';
import { AlphabeticalScroll } from '../AlphabeticalScroll';
import FilterListInput from '../FilterListInput';
import { AddButton } from '../header/AddButton';
import { ListHeaderRight } from '../header/ListHeaderRight';
import { useMenu } from '../hooks/useMenu';
import { ConfirmModal, ConfirmModalProps } from '../modals/ConfirmModal';
import { TaskTile, TaskTileViewingMode } from '../tiles/TaskTile';

import {
  EMPTY_STRING,
  ESTIMATED_SIZE_FOR_TASKS_LIST,
  LIST_HAPTICS,
  SORT_ORDER_VALUE_DEFAULT,
} from '@/constants/general';
import { type AppParamList, Routes } from '@/constants/navigation';
import { toggleTaskCompleted, tasksSelector } from '@/state/slices/tasksSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { deleteTasks } from '@/state/thunks';
import { Task } from '@/types/Task';
import { ListRow } from '@/types/general';
import {
  getKeyToUse,
  getNewViewingMode,
  joinWithAnd,
  resetConfirmModalProps,
} from '@/utils/helpers';

type TasksListProps = object;

export function TasksList(props: TasksListProps) {
  const navigation = useNavigation<NavigationProp<AppParamList>>();
  const tasks = useAppSelector(tasksSelector);
  const toast = useToast();
  const dispatch = useAppDispatch();
  const listRef = useRef<FlashList<Task> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [tasksToDisplay, setTasksToDisplay] = useState(tasks);
  const [sortOrderValue, setSortOrderValue] = useState(
    SORT_ORDER_VALUE_DEFAULT,
  );
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmModalProps>(
    {} as ConfirmModalProps,
  );
  const [viewingMode, setViewingMode] = useState(TaskTileViewingMode.Full);

  const iconSize = useMemo(
    () => (viewingMode === TaskTileViewingMode.Basic ? 16 : 24),
    [viewingMode],
  );

  const [, closeMenu] = useMenu({
    navigationOptionsGetter: (menuRef) => ({
      headerRight: () => (
        <ListHeaderRight
          ref={menuRef}
          onResetPress={onResetPress}
          options={[
            selectedTasks.length > 0
              ? {
                  text: 'Delete Selected',
                  onPress: onDeleteSelectedPress,
                }
              : undefined,
            {
              text: 'Toggle Mode',
              onPress: onToggleViewingModePress,
            },
          ]}
        />
      ),
      headerLeft: () => <AddButton onPress={onAddTaskPress} />,
    }),
  });

  const onAddTaskPress = useCallback(() => {
    closeMenu();
    navigation.navigate(Routes.TaskModal, { key: { _id: EMPTY_STRING } });
  }, [closeMenu, navigation]);

  const onResetPress = useCallback(() => {
    setTasksToDisplay(tasks);
    setSelectedTasks([]);
    setIsMultiSelectMode(false);
  }, [tasks]);

  const resetMultiSelectionMode = useCallback(() => {
    setIsMultiSelectMode(false);
    setSelectedTasks([]);
  }, []);

  const onDeleteSelectedPress = useCallback(() => {
    setConfirmModalProps({
      isVisible: true,
      title: 'Deleting Tasks',
      message: `Are you sure you want to delete ${joinWithAnd(selectedTasks.map((task) => `'${task.title}'`))}?`,
      onCancel: () => resetConfirmModalProps(setConfirmModalProps),
      onConfirm: () => {
        const tasksDeleted = [...selectedTasks];
        dispatch(deleteTasks({ ids: tasksDeleted.map((task) => task._id) }));
        resetMultiSelectionMode();
        resetConfirmModalProps(setConfirmModalProps);
        toast.show({
          id: 'tasks-list-delete',
          placement: 'bottom',
          duration: 4000,
          render: () => (
            <ListActionToast
              message={`${tasksDeleted.length} task${tasksDeleted.length === 1 ? '' : 's'} deleted.`}
            />
          ),
        });
      },
    });
  }, [selectedTasks, resetMultiSelectionMode, dispatch, toast]);

  const onToggleViewingModePress = useCallback(() => {
    setViewingMode((current) => getNewViewingMode(current));
  }, []);

  const onSwipeRight = useCallback(
    (task: Task) => {
      closeMenu();
      LIST_HAPTICS.handleSwipeItem()();
      dispatch(toggleTaskCompleted(task._id));
      toast.show({
        id: 'tasks-list-complete',
        placement: 'bottom',
        duration: 4000,
        render: () => (
          <ListActionToast
            message={`'${task.title}' marked ${task.isCompleted ? 'not completed' : 'completed'}.`}
            onUndo={() => dispatch(toggleTaskCompleted(task._id))}
          />
        ),
      });
    },
    [closeMenu, dispatch, toast],
  );

  const onSwipeLeft = useCallback(
    (task: Task) => {
      closeMenu();
      setConfirmModalProps({
        isVisible: true,
        title: 'Delete Task',
        message: `Are you sure you want to delete '${task.title}'?`,
        confirmButton: { text: 'Yes', action: 'negative' },
        cancelButton: { action: 'positive' },
        onCancel: () => resetConfirmModalProps(setConfirmModalProps),
        onConfirm: () => {
          LIST_HAPTICS.handleSwipeItem(true)();
          dispatch(deleteTasks({ ids: [task._id] }));
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          resetConfirmModalProps(setConfirmModalProps);
          toast.show({
            id: 'tasks-list-delete',
            placement: 'bottom',
            duration: 4000,
            render: () => (
              <ListActionToast message={`'${task.title}' deleted.`} />
            ),
          });
        },
      });
    },
    [closeMenu, dispatch, toast],
  );

  function renderItem({ item, index }: ListRow<Task>) {
    return (
      <SwipeableRow
        key={getKeyToUse(item)}
        swipeableProps={{ onBegan: closeMenu }}
        leftSwipe={{
          title: <FontAwesome name="trash" color="white" size={iconSize} />,
          backgroundColor: 'darkred',
          onPress: onSwipeLeft.bind(null, item),
        }}
        rightSwipe={{
          title: (
            <Box alignItems="center">
              <FontAwesome name="check" color="white" size={iconSize} />
              <Text color="$white">
                {item.isCompleted ? 'Reopen' : 'Complete'}
              </Text>
            </Box>
          ),
          backgroundColor: 'darkgreen',
          onPress: onSwipeRight.bind(null, item),
        }}
      >
        <TaskTile
          isMultiSelectMode={isMultiSelectMode}
          item={item}
          viewingMode={viewingMode}
          buttonProps={{
            onLongPress: () => {
              setSelectedTasks(isMultiSelectMode ? [] : [item]);
              setIsMultiSelectMode((current) => !current);
              LIST_HAPTICS.handleMultipleItemSelect(isMultiSelectMode)();
            },
          }}
          onSelect={(task) => {
            const isSelected = !!selectedTasks.find(
              (taskLocal) => getKeyToUse(task) === getKeyToUse(taskLocal),
            );
            setSelectedTasks((current) =>
              isSelected
                ? current.filter(
                    (taskLocal) => getKeyToUse(task) !== getKeyToUse(taskLocal),
                  )
                : [...current, task],
            );
            LIST_HAPTICS.handleIsSelected(isSelected)();
          }}
          isSelected={
            !!selectedTasks.find(
              (taskLocal) => getKeyToUse(item) === getKeyToUse(taskLocal),
            )
          }
        />
      </SwipeableRow>
    );
  }

  return (
    <>
      <FilterListInput
        list={tasks}
        onFilterChange={(filteredValues, _filterValue, newSortOrderValue) => {
          setTasksToDisplay(filteredValues);
          setSortOrderValue(newSortOrderValue);
        }}
        sortTypes={Object.values(SortType).filter(
          (sortType) => sortType !== SortType.None,
        )}
        swapElementOrder
      />
      <FlashList
        ref={listRef}
        keyboardShouldPersistTaps="always"
        refreshing={refreshing}
        extraData={{ viewingMode, isMultiSelectMode }}
        onTouchStart={closeMenu}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 1000);
        }}
        data={tasksToDisplay}
        renderItem={renderItem}
        keyExtractor={(task: Task) => task._id || getKeyToUse(task)}
        estimatedItemSize={ESTIMATED_SIZE_FOR_TASKS_LIST}
        ItemSeparatorComponent={() => <ListItemSeparator />}
      />
      <AlphabeticalScroll
        items={tasksToDisplay}
        sortOrderValue={sortOrderValue}
        onCharPress={(index) => {
          listRef.current?.scrollToIndex({ index, animated: true });
        }}
      />
      <ConfirmModal {...confirmModalProps} />
    </>
  );
}
