import { ValueChain } from '../entities/ValueChain';

type IProgress = [number, number];

export function getProgressValueChains(valueChains: ValueChain[]) {
  if (!valueChains) {
    return {
      progress: null,
      goal: null,
    };
  }

  const [progressCurrent, progressTotal] = valueChains.reduce<IProgress>(
    ([current, total], valueChain) => {
      if (!valueChain.tasks) {
        return [current, total];
      }

      const totalTaks = valueChain.tasks.length;

      const endedTasks = valueChain.tasks.filter(({ endDate }) => !!endDate).length;

      return [current + endedTasks, total + totalTaks];
    },
    [0, 0],
  );

  return {
    progress: progressTotal ? progressCurrent : null,
    goal: progressTotal || null,
  };
}
