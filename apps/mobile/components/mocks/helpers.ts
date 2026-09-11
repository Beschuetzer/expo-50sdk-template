import {
  TIME_SPAN_TO_MILLISECONDS_MAPPING,
  WEEK_IN_MS,
} from '@/constants/general';
import { Task, TaskPriority } from '@/types/Task';
import { TimeSpan } from '@/types/general';
import { getId } from '@/utils/helpers';

const MOCK_IMAGES = [
  'https://picsum.photos/seed/1/200/300',
  'https://picsum.photos/seed/2/200/300',
  'https://picsum.photos/seed/3/200/300',
];

export function getRandomEnumValue<T>(enumeration: any): T {
  const values = Object.values(enumeration) as T[];
  const randomIndex = Math.floor(Math.random() * values.length);
  return (values as any)[randomIndex] as T;
}

export function getRandomInt(min: number, max: number) {
  if (min > max) {
    throw new Error('Min must be less than or equal to max');
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 *Builds a randomized {@link Task} for use in tests, storybook-style manual testing screens,
 *and jest fixtures (see `constants/testing.ts`).
 **/
export function getRandomTask(title: string): Task {
  return {
    _id: getId(),
    addedDate: Date.now() - getRandomInt(0, WEEK_IN_MS * 52),
    lastUpdatedDate: Date.now(),
    code: '',
    dueDate:
      Date.now() +
      TIME_SPAN_TO_MILLISECONDS_MAPPING[getRandomEnumValue<TimeSpan>(TimeSpan)],
    hasBeenSaved: false,
    imageToUseIndex: 0,
    images: Array(getRandomInt(0, 2)).fill(
      MOCK_IMAGES[getRandomInt(0, MOCK_IMAGES.length - 1)],
    ),
    isCompleted: false,
    needsSaving: true,
    notes: '',
    priority: getRandomEnumValue<TaskPriority>(TaskPriority),
    title,
  };
}
