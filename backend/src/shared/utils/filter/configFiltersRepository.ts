import {
  Between,
  Brackets,
  FindConditions,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Raw,
  SelectQueryBuilder,
} from 'typeorm';

type IOperation = 'in' | 'like' | 'gte' | 'lte' | 'between' | 'array_contains' | 'equal';

type IValues = Date | number | string;

export type IFilterValue = [IOperation, ...IValues[]];

export type IFilterConfig = { [key: string]: IFilterValue };

const operationsFuncion = {
  in: In,
  like: Raw,
  gte: MoreThanOrEqual,
  lte: LessThanOrEqual,
  between: Between,
  array_contains: Raw,
};

export function configFiltersRepository<T>(filters: IFilterConfig) {
  const filtersFixed = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== null && v !== undefined),
  );

  const filtersConfig: FindConditions<T> = {};

  Object.entries(filtersFixed).forEach(([field, [operation, ...values]]) => {
    if (operation === 'between') {
      filtersConfig[field] = operationsFuncion[operation](values[0], values[1]);
    } else if (operation === 'in') {
      filtersConfig[field] = operationsFuncion[operation](values);
    } else if (operation === 'array_contains') {
      filtersConfig[field] = operationsFuncion[operation](
        alias => `'${values[0]}' = any(${alias})`,
      );
    } else if (operation === 'like') {
      filtersConfig[field] = operationsFuncion[operation](
        alias => `${alias} ILIKE '%${values[0]}%'`,
      );
    } else if (operation === 'equal') {
      // eslint-disable-next-line prefer-destructuring
      filtersConfig[field] = values[0];
    } else {
      filtersConfig[field] = operationsFuncion[operation](values[0]);
    }
  });

  return filtersConfig;
}

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

export function configFiltersAlias<T>({
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
