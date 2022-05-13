import { isAfter, isBefore } from 'date-fns';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { OldProduct } from '../oldClasses/ProductUniqueDate';

export class UniqueDateProduct1649093695078 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const products = await queryRunner.manager.getRepository(OldProduct).find();

    const newProducts = products.map(product => {
      const {
        availableDateCalc,
        availableDateFixed,
        startDateCalc,
        endDateCalc,
        startDateFixed,
        endDateFixed,
      } = product;

      if (!availableDateFixed) {
        product.availableDateFixed = availableDateCalc;
      } else if (
        availableDateFixed &&
        availableDateCalc &&
        isBefore(availableDateCalc, availableDateFixed)
      ) {
        product.availableDateFixed = availableDateCalc;
      }

      if (!startDateFixed) {
        product.startDateFixed = startDateCalc;
      } else if (startDateFixed && startDateCalc && isBefore(startDateCalc, startDateFixed)) {
        product.startDateFixed = startDateCalc;
      }

      if (!endDateFixed) {
        product.endDateFixed = endDateCalc;
      } else if (endDateFixed && endDateCalc && isAfter(endDateCalc, endDateFixed)) {
        product.endDateFixed = endDateCalc;
      }

      return product;
    });

    await queryRunner.manager.getRepository(OldProduct).save(newProducts);

    await queryRunner.renameColumn('products', 'start_date_fixed', 'start_date');
    await queryRunner.renameColumn('products', 'end_date_fixed', 'end_date');
    await queryRunner.renameColumn('products', 'available_date_fixed', 'available_date');

    await queryRunner.dropColumn('products', 'start_date_calc');
    await queryRunner.dropColumn('products', 'end_date_calc');
    await queryRunner.dropColumn('products', 'available_date_calc');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('products', 'start_date', 'start_date_fixed');
    await queryRunner.renameColumn('products', 'end_date', 'end_date_fixed');
    await queryRunner.renameColumn('products', 'available_date', 'available_date_fixed');

    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'start_date_calc',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'end_date_calc',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'available_date_calc',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
    );
  }
}
