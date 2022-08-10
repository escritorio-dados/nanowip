import { ValueChain } from '../entities/ValueChain';

export function getActiveTagsValueChains(valueChains: ValueChain[]) {
  if (!valueChains) {
    return [];
  }

  return valueChains.reduce<string[]>((currentTags, valueChain) => {
    if (!valueChain.tasks) {
      return currentTags;
    }

    const newTags = [];

    valueChain.tasks.forEach(task => {
      const availableState = !!task.availableDate && !task.startDate;
      const inProgressState = !!task.startDate && !task.endDate;

      if (task.tagsGroup && (availableState || inProgressState)) {
        newTags.push(...task.tagsGroup.tags.map(tag => tag.name));
      }
    });

    return [...currentTags, ...newTags];
  }, []);
}
