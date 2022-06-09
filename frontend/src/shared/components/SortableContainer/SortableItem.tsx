import { Box, BoxProps } from '@mui/material';
import type { Identifier, XYCoord } from 'dnd-core';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

type DragItem = { index: number; id: string; type: string };

type IObjectWithId = { [key: string]: any; id: string | number };

type ISortableItem<T extends IObjectWithId> = Pick<BoxProps, 'sx'> & {
  id: string | number;
  index: number;
  moveItem: (sourceIndex: number, targetIndex: number) => void;
  itemType: string;
  item: T;
  renderItem: (item: T) => JSX.Element | string;
};

export function SortableItem<T extends IObjectWithId>({
  itemType,
  index,
  moveItem,
  id,
  renderItem,
  item,
  sx,
}: ISortableItem<T>) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: itemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(dragItem: DragItem, monitor) {
      if (!ref.current) {
        return;
      }

      const sourceIndex = dragItem.index;

      const targetIndex = index;

      // Não ativando com ele mesmo
      if (sourceIndex === targetIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Dragging downwards
      if (sourceIndex < targetIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (sourceIndex > targetIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveItem(sourceIndex, targetIndex);

      dragItem.index = targetIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: itemType,
    item: () => {
      return { id, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <Box ref={ref} sx={{ ...sx, opacity: isDragging ? 0 : 1 }} data-handler-id={handlerId}>
      {renderItem(item)}
    </Box>
  );
}
