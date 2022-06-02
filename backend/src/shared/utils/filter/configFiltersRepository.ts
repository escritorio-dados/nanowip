import { Brackets, SelectQueryBuilder } from 'typeorm';

type IOperation = 'in' | 'like' | 'gte' | 'lte' | 'between' | 'array_contains' | 'equal';

type IValues = Date | number | string;

export type IFilterValue = [IOperation, ...IValues[]];

export type IFilterConfig = { [key: string]: IFilterValue };

export type IFilterValueAlias = {
  operation: IOperation;
  values?: IValues[];
  alias: string[];
  field: string;
};

type IConfigFilterAlias<T> = {
  query: SelectQueryBuilder<T>;
  filter: IFilterValueAlias;
};

function configFiltersAlias<T>({
  filter: { alias, operation, values, field },
  query,
}: IConfigFilterAlias<T>) {
  if (!values) {
    return;
  }

  values = values.filter(value => !!value);

  if (values.length === 0) {
    return;
  }

  const [alias1, ...subAlias] = alias;

  let filter: string | Brackets;

  const value1Name = `${alias1}${field}_1`;
  const value2Name = `${alias1}${field}_2`;
  const valuesName = `${alias1}${field}_values`;

  switch (operation) {
    case 'between':
      filter = new Brackets(qb => {
        qb.where(`${alias1}${field} between :${value1Name} and :${value2Name}`, {
          [value1Name]: values[0],
          [value2Name]: values[1],
        });

        subAlias.forEach(a => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`${a}${field} between :${value1Name} and :${value2Name}`, {
                  [value1Name]: values[0],
                  [value2Name]: values[1],
                })
                .andWhere(`${a}id is not null`);
            }),
          );
        });
      });
      break;
    case 'in':
      filter = new Brackets(qb => {
        qb.where(`${alias1}${field} in (:...${valuesName})`, { [valuesName]: values });

        subAlias.forEach(a => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`${a}${field} in (:...${valuesName})`, { [valuesName]: values })
                .andWhere(`${a}id is not null`);
            }),
          );
        });
      });
      break;
    case 'array_contains':
      filter = new Brackets(qb => {
        qb.where(`:${value1Name} = any(${alias1}${field})`, { [value1Name]: values[0] });

        subAlias.forEach(a => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`${value1Name} = any(${a}${field})`, { [value1Name]: values[0] })
                .andWhere(`${a}id is not null`);
            }),
          );
        });
      });
      break;
    case 'like':
      filter = new Brackets(qb => {
        qb.where(`${alias1}${field} ilike :${value1Name}`, { [value1Name]: `%${values[0]}%` });

        subAlias.forEach(a => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`${a}${field} ilike :${value1Name}`, { [value1Name]: `%${values[0]}%` })
                .andWhere(`${a}id is not null`);
            }),
          );
        });
      });
      break;
    case 'equal':
      filter = new Brackets(qb => {
        qb.where(`${alias1}${field} = :${value1Name}`, { [value1Name]: values[0] });

        subAlias.forEach(a => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`${a}${field} = :${value1Name}`, { [value1Name]: values[0] })
                .andWhere(`${a}id is not null`);
            }),
          );
        });
      });
      break;
    case 'gte':
      filter = new Brackets(qb => {
        qb.where(`${alias1}${field} >= :${value1Name}`, { [value1Name]: values[0] });

        subAlias.forEach(a => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`${a}${field} >= :${value1Name}`, { [value1Name]: values[0] })
                .andWhere(`${a}id is not null`);
            }),
          );
        });
      });
      break;
    case 'lte':
      filter = new Brackets(qb => {
        qb.where(`${alias1}${field} <= :${value1Name}`, { [value1Name]: values[0] });

        subAlias.forEach(a => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`${a}${field} <= :${value1Name}`, { [value1Name]: values[0] })
                .andWhere(`${a}id is not null`);
            }),
          );
        });
      });
      break;
    default:
      break;
  }

  query.andWhere(filter);
}

export type ICustomFilters = (Brackets | string)[];

type IConfigureFiltersQuery<T> = {
  filters: IFilterValueAlias[];
  query: SelectQueryBuilder<T>;
  customFilters?: ICustomFilters;
};

type IConfigureFiltersQueryOr<T> = {
  filters: IFilterValueAlias[];
  query: SelectQueryBuilder<T>;
  customFilters?: ICustomFilters[];
};

export function configFiltersQuery<T>({
  customFilters,
  filters,
  query,
}: IConfigureFiltersQuery<T>) {
  filters.forEach(filter => {
    configFiltersAlias({ filter, query });
  });

  if (customFilters) {
    customFilters.forEach(customFilter => {
      if (customFilter) {
        query.andWhere(customFilter);
      }
    });
  }
}

export function configFiltersQueryOr<T>({
  customFilters,
  filters,
  query,
}: IConfigureFiltersQueryOr<T>) {
  filters.forEach(filter => {
    configFiltersAlias({ filter, query });
  });

  if (customFilters) {
    customFilters.forEach(customFilter => {
      const [filter1, ...othersFilters] = customFilter;

      if (filter1) {
        query.andWhere(
          new Brackets(q => {
            q.where(filter1 as any);

            othersFilters.forEach(otherFilter => {
              if (otherFilter) {
                q.orWhere(otherFilter as any);
              }
            });
          }),
        );
      }
    });
  }
}
