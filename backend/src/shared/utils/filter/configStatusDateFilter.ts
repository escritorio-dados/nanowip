import { Brackets } from 'typeorm';

import { IStatusDateFilter } from '../getStatusDate';

type IConfigStatusDateFilter = { statusDate: IStatusDateFilter; entitiesAlias: string[] };

export function configStatusDatesFilters({
  statusDate,
  entitiesAlias,
}: IConfigStatusDateFilter): string | Brackets {
  let filter: string | Brackets;

  const [alias1, ...subAlias] = entitiesAlias;

  switch (statusDate) {
    case 'late':
      filter = new Brackets(qb => {
        qb.where(
          new Brackets(qb2 => {
            qb2.where(`${alias1}deadline < now()`).andWhere(`${alias1}end_date is null`);
          }),
        );

        subAlias.forEach(alias => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`${alias}deadline < now()`)
                .andWhere(`${alias}end_date is null`)
                .andWhere(`${alias}id is not null`);
            }),
          );
        });
      });
      break;
    case 'ended':
      filter = new Brackets(qb => {
        qb.where(`${alias1}end_date is not null`);

        subAlias.forEach(alias => {
          qb.orWhere(`${alias}end_date is not null`);
        });
      });
      break;
    case 'started':
      filter = new Brackets(qb => {
        qb.where(
          new Brackets(qb2 => {
            qb2.where(`${alias1}start_date is not null`).andWhere(`${alias1}end_date is null`);
          }),
        );

        subAlias.forEach(alias => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`${alias}start_date is not null`)
                .andWhere(`${alias}end_date is null`)
                .andWhere(`${alias}id is not null`);
            }),
          );
        });
      });
      break;
    case 'available':
      filter = new Brackets(qb => {
        qb.where(
          new Brackets(qb2 => {
            qb2
              .where(`${alias1}available_date is not null`)
              .andWhere(`${alias1}start_date is null`);
          }),
        );

        subAlias.forEach(alias => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`${alias}available_date is not null`)
                .andWhere(`${alias}start_date is null`)
                .andWhere(`${alias}id is not null`);
            }),
          );
        });
      });
      break;
    case 'created':
      filter = new Brackets(qb => {
        qb.where(`${alias1}available_date is null`);

        subAlias.forEach(alias => {
          qb.orWhere(`${alias}available_date is null`).andWhere(`${alias}id is not null`);
        });
      });
      break;

    default:
      break;
  }

  return filter;
}
