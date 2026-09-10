import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useNavigation } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

import { AddButton } from '@/components/header/AddButton';
import { useAutoLogin } from '@/components/hooks/useAutoLogin';
import { useAwakenBff } from '@/components/hooks/useAwakenBff';
import { useGpsCoordinate } from '@/components/hooks/useGeoLocation';
import { useInitializer } from '@/components/hooks/useInitializer';
import { useMenu } from '@/components/hooks/useMenu';
import { useNotificationsPermissions } from '@/components/hooks/useNotificationsPermissions';
import { ListItemSeparator } from '@/components/lists/ListItemSeparator';
import { TaskTile } from '@/components/tiles/TaskTile';
import { Routes } from '@/constants/navigation';
import { resetErrors, setError } from '@/state/slices/generalSlice';
import { toggleTaskCompleted, tasksSelector } from '@/state/slices/tasksSlice';
import { useAppDispatch, useAppSelector } from '@/state/store';
import { logWhenDevelopmentMode } from '@/utils/logging';

function TaskCountSummary() {
  const tasks = useAppSelector(tasksSelector);
  const completedCount = tasks.filter((task) => task.isCompleted).length;
  const overdueCount = tasks.filter(
    (task) => !task.isCompleted && task.dueDate && task.dueDate < Date.now(),
  ).length;

  return (
    <HStack justifyContent="space-around" py="$3">
      <VStack alignItems="center">
        <Heading size="lg">{tasks.length}</Heading>
        <Text size="xs">Total</Text>
      </VStack>
      <VStack alignItems="center">
        <Heading size="lg">{completedCount}</Heading>
        <Text size="xs">Completed</Text>
      </VStack>
      <VStack alignItems="center">
        <Heading size="lg">{overdueCount}</Heading>
        <Text size="xs">Overdue</Text>
      </VStack>
    </HStack>
  );
}

/**
 *This dashboard tab demonstrates `react-native-tab-view` (Active/Completed scenes) on top of the
 *same `tasksSlice` data used by the `TasksScreen` tab, plus the app-startup hooks (auto-login for
 *dev builds, waking a sleeping backend, notification permission requests, geolocation).
 **/
export default function DashboardScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const layout = useWindowDimensions();
  const tasks = useAppSelector(tasksSelector);

  useAwakenBff();
  useAutoLogin();
  useInitializer();
  useNotificationsPermissions();
  useGpsCoordinate({
    onSuccess: (gpsCoordinate) => logWhenDevelopmentMode({ gpsCoordinate }),
  });

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'active', title: 'Active' },
    { key: 'completed', title: 'Completed' },
  ]);

  const [, closeMenu] = useMenu({
    navigationOptionsGetter: () => ({
      headerLeft: () => (
        <AddButton
          onPress={() => {
            closeMenu();
            // @ts-ignore -- expo-router v3 typed params
            navigation.navigate(Routes.TaskModal, { key: { _id: '' } });
          }}
        />
      ),
    }),
  });

  const renderTaskRow = useCallback(
    (task: (typeof tasks)[number]) => (
      <Box key={task._id}>
        <TaskTile
          item={task}
          onPress={() => dispatch(toggleTaskCompleted(task._id))}
        />
      </Box>
    ),
    [dispatch],
  );

  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.isCompleted),
    [tasks],
  );
  const completedTasks = useMemo(
    () => tasks.filter((task) => task.isCompleted),
    [tasks],
  );

  const renderScene = SceneMap({
    active: () => (
      <VStack flex={1}>
        {activeTasks.length === 0 ? (
          <Text textAlign="center" mt="$4">
            Nothing active - enjoy the break!
          </Text>
        ) : (
          activeTasks.map(renderTaskRow)
        )}
      </VStack>
    ),
    completed: () => (
      <VStack flex={1}>
        {completedTasks.length === 0 ? (
          <Text textAlign="center" mt="$4">
            Nothing completed yet.
          </Text>
        ) : (
          completedTasks.map(renderTaskRow)
        )}
      </VStack>
    ),
  });

  const onTriggerErrorPress = useCallback(() => {
    try {
      throw new Error('Dashboard test error');
    } catch (error) {
      dispatch(
        setError({
          message: 'Test error triggered from the dashboard',
          statusCode: 500,
          error:
            error instanceof Error
              ? {
                  message: error.message,
                  stack: error.stack,
                  name: error.name,
                }
              : { message: 'Unknown error' },
          stack: error instanceof Error ? error.stack : undefined,
        }),
      );
    }
  }, [dispatch]);

  const onClearErrorsPress = useCallback(() => {
    dispatch(resetErrors());
  }, [dispatch]);

  return (
    <VStack flex={1}>
      <TaskCountSummary />
      <HStack mt="$3" mx="$4" space="md">
        <Button flex={1} onPress={onTriggerErrorPress}>
          <ButtonText>Trigger Test Error</ButtonText>
        </Button>
        <Button flex={1} variant="outline" onPress={onClearErrorsPress}>
          <ButtonText>Clear Errors</ButtonText>
        </Button>
      </HStack>
      <ListItemSeparator />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(tabBarProps) => (
          <TabBar
            {...tabBarProps}
            style={{ backgroundColor: 'white' }}
            indicatorStyle={{ backgroundColor: '#1e40af' }}
            activeColor="#1e40af"
            inactiveColor="#64748b"
          />
        )}
      />
    </VStack>
  );
}
