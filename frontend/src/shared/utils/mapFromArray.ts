type IGetKey<T> = (item: T) => string;

type IGetValue<T, V> = (item: T) => V;

export type IMap<V> = {
  [key: string]: V;
};

export function mapFromArray<T, V = T>(
  items: T[],
  getKey: IGetKey<T>,
  getValue?: IGetValue<T, V>,
): IMap<V> {
  const map: IMap<V> = {};

  items.forEach((item) => {
    const key = getKey(item);

    if (getValue) {
      map[key] = getValue(item);
    } else {
      map[key] = item as any;
    }
  });

  return map;
}
