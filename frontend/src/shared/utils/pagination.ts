import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';

export const orderTranslator: Record<string, string> = {
  ASC: 'Crescente',
  DESC: 'Decrescente',
};

export const orderOptions = Object.entries(orderTranslator).map(([key, value]) => {
  return {
    label: value,
    value: key,
  };
});

export function getSortOptions<T = Record<string, string>>(sortOptions: T) {
  return Object.entries(sortOptions).map(([key, value]) => {
    return {
      label: value,
      value: key,
    };
  });
}

export type IPaginationConfig<T> = {
  page: number;
  sort_by: string;
  order_by: string;
  filters: T;
};

type IHandle<T> = { current: IPagingResult<T> | undefined };
type IHandleAdd<T> = IHandle<T> & { newData: T };
type IHandleUpdate<T> = IHandle<T> & { id: string; newData: T };
type IHandleDelete<T> = IHandle<T> & { id: string };

export function handleAddItem<T extends { id: string }>({ current, newData }: IHandleAdd<T>) {
  if (!current) {
    return current;
  }

  return {
    ...current,
    data: [newData, ...current.data],
  };
}

export function handleUpdateItem<T extends { id: string }>({
  current,
  id,
  newData,
}: IHandleUpdate<T>) {
  if (!current) {
    return current;
  }

  return {
    ...current,
    data: current.data.map((item) => (item.id === id ? newData : item)),
  };
}

export function handleDeleteItem<T extends { id: string }>({ current, id }: IHandleDelete<T>) {
  if (!current) {
    return current;
  }

  return {
    ...current,
    data: current.data.filter((item) => item.id !== id),
  };
}
