import { max } from 'date-fns';

import { ValueChain } from '@modules/valueChains/entities/ValueChain';

type IInfoValueChains = {
  progress: {
    progress: number | null;
    goal: number | null;
  };
  tags: string[];
  maxAvailableDate?: Date;
};

export function getInfoValueChains(valueChains: ValueChain[]): IInfoValueChains {
  if (!valueChains) {
    return {
      progress: {
        progress: null,
        goal: null,
      },
      maxAvailableDate: null,
      tags: [],
    };
  }

  let progressCurrent = 0;
  let progressTotal = 0;

  const tags: string[] = [];
  const availableDates: Date[] = [];

  valueChains.forEach(valueChain => {
    if (valueChain.tasks && valueChain.tasks.length > 0) {
      const totalTaks = valueChain.tasks.length;

      const endedTasks = valueChain.tasks.filter(({ endDate }) => !!endDate).length;

      progressCurrent += endedTasks;
      progressTotal += totalTaks;

      valueChain.tasks.forEach(task => {
        const availableState = !!task.availableDate && !task.startDate;
        const inProgressState = !!task.startDate && !task.endDate;

        if (availableState || inProgressState) {
          if (task.tagsGroup) {
            tags.push(...task.tagsGroup.tags.map(tag => tag.name));
          }

          availableDates.push(task.availableDate);
        }
      });
    }
  });

  const maxAvailableDate = availableDates.length > 0 ? max(availableDates) : null;

  return {
    progress: {
      progress: progressTotal ? progressCurrent : null,
      goal: progressTotal || null,
    },
    maxAvailableDate,
    tags,
  };
}
