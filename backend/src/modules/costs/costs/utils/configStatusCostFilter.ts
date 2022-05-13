import { Brackets } from 'typeorm';

import { IStatusCostFilter } from './getStatusCost';

type IConfigStatusDateFilter = { statusDate: IStatusCostFilter; entitiesAlias: string[] };

export function configStatusCostFilters({
  statusDate,
  entitiesAlias,
}: IConfigStatusDateFilter): string | Brackets {
  let filter: string | Brackets;

  const [alias1, ...subAlias] = entitiesAlias;

  switch (statusDate) {
    case 'late': {
      filter = new Brackets(qb => {
        qb.where(
          new Brackets(qb2 => {
            qb2.where(`${alias1}due_date < now()`).andWhere(`${alias1}payment_date is null`);
          }),
        );

        subAlias.forEach(alias => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`${alias}due_date < now()`)
                .andWhere(`${alias}payment_date is null`)
                .andWhere(`${alias}id is not null`);
            }),
          );
        });
      });

      break;
    }
    case 'almostLate': {
      filter = new Brackets(qb => {
        qb.where(
          new Brackets(qb2 => {
            qb2
              .where(`date_part('day',  ${alias1}due_date - now()) <= 5`)
              .andWhere(`${alias1}payment_date is null`);
          }),
        );

        subAlias.forEach(alias => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`date_part('day',  ${alias}due_date - now()) <= 5`)
                .andWhere(`${alias}payment_date is null`)
                .andWhere(`${alias}id is not null`);
            }),
          );
        });
      });

      break;
    }
    case 'issued': {
      filter = new Brackets(qb => {
        qb.where(
          new Brackets(qb2 => {
            qb2.where(`${alias1}issue_date is not null`).andWhere(`${alias1}payment_date is null`);
          }),
        );

        subAlias.forEach(alias => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`${alias}issue_date is not null`)
                .andWhere(`${alias}payment_date is null`)
                .andWhere(`${alias}id is not null`);
            }),
          );
        });
      });

      break;
    }
    case 'created': {
      filter = new Brackets(qb => {
        qb.where(
          new Brackets(qb2 => {
            qb2
              .where(`${alias1}issue_date is null`)
              .andWhere(`${alias1}payment_date is null`)
              .andWhere(`${alias1}due_date > now()`);
          }),
        );

        subAlias.forEach(alias => {
          qb.orWhere(
            new Brackets(qb2 => {
              qb2
                .where(`${alias}issue_date is null`)
                .andWhere(`${alias}payment_date is null`)
                .andWhere(`${alias}due_date > now()`)
                .andWhere(`${alias}id is not null`);
            }),
          );
        });
      });

      break;
    }
    case 'paid': {
      filter = new Brackets(qb => {
        qb.where(`${alias1}payment_date is not null`);

        subAlias.forEach(alias => {
          qb.orWhere(`${alias}payment_date is not null`).andWhere(`${alias}id is not null`);
        });
      });

      break;
    }
    default:
      break;
  }

  return filter;
}
