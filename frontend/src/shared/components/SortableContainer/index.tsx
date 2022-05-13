import { SxProps, Theme } from '@mui/material';
import { useCallback } from 'react';

import { SortableItem } from './SortableItem';

export type Item = { id: number; text: string };

export type ContainerState = { cards: Item[] };

type IObjectWithId = { [key: string]: any; id: string | number };

type ISortableContainer<T extends IObjectWithId> = {
  items: T[];
  updateItems: (newItens: T[]) => void;
  itemType: string;
  SxItemContainer?: SxProps<Theme>;
  renderItem: (item: T) => JSX.Element | string;
};

export function SortableContainer<T extends IObjectWithId>({
  items,
  updateItems,
  itemType,
  SxItemContainer,
  renderItem,
}: ISortableContainer<T>) {
  const moveItem = useCallback(
    (sourceIndex: number, targetIndex: number) => {
      const sortedItems = [...items];

      const [item] = sortedItems.splice(sourceIndex, 1);

      sortedItems.splice(targetIndex, 0, item);

      updateItems(sortedItems);
    },
    [items, updateItems],
  );

  return (
    <>
      {items.map((item, index) => (
        <SortableItem<T>
          index={index}
          itemType={itemType}
          moveItem={moveItem}
          sxContainer={SxItemContainer}
          key={item.id}
          id={item.id}
          renderItem={renderItem}
          item={item}
        />
      ))}
    </>
  );
}
