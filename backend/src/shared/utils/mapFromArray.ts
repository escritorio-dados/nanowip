type IGetKey<T> = (item: T) => string;

export type IMap<T> = {
  [key: string]: T;
};

export function mapFromArray<T>(items: T[], getKey: IGetKey<T>): IMap<T> {
  const map: IMap<T> = {};

  items.forEach(item => {
    const key = getKey(item);

    map[key] = item;
  });

  return map;
}
