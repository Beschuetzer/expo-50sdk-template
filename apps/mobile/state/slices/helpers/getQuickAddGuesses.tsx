import * as fuzzball from 'fuzzball';

import { Task } from '@/types/Task';
import { BulkAddGuesses, BulkAddList } from '@/types/quickAdd';

const MINIMUM_MATCH_SCORE = 60;
const MAX_GUESSES_PER_DRAFT = 3;

/**
 *For each draft title pasted into `BulkAddTasksModal`, finds existing tasks with a similar
 *title (using `fuzzball`'s fuzzy-matching `ratio` score) so the user can link the draft to an
 *existing task instead of creating a duplicate.
 **/
export function getBulkAddGuesses(
  tasks: Task[],
  bulkAddList: BulkAddList,
): BulkAddGuesses {
  const guesses: BulkAddGuesses = {};

  for (const draft of bulkAddList.drafts || []) {
    if (!draft.title) continue;
    const scored = (tasks || [])
      .map(
        (task) =>
          [task, fuzzball.ratio(draft.title, task.title)] as [Task, number],
      )
      .filter(([, score]) => score >= MINIMUM_MATCH_SCORE)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_GUESSES_PER_DRAFT);

    if (scored.length > 0) {
      guesses[draft.title] = scored;
    }
  }

  return guesses;
}
