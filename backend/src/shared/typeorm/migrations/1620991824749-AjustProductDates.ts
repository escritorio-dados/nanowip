import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AjustProductDates1620991824749 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Alterar nomes das datas já cadastradas
    await queryRunner.renameColumn('products', 'start_date', 'start_date_fixed');
    await queryRunner.renameColumn('products', 'end_date', 'end_date_fixed');
    await queryRunner.renameColumn('products', 'available_date', 'available_date_fixed');

    // Criar Colunas das datas calculadas
    await queryRunner.addColumns('products', [
      new TableColumn({
        name: 'start_date_calc',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
      new TableColumn({
        name: 'end_date_calc',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
      new TableColumn({
        name: 'available_date_calc',
        type: 'timestamp with time zone',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Excluindo Datas calculadas
    await queryRunner.dropColumn('products', 'available_date_calc');
    await queryRunner.dropColumn('products', 'end_date_calc');
    await queryRunner.dropColumn('products', 'start_date_calc');

    // Voltando o nome das datas fixas ao normal
    await queryRunner.renameColumn('products', 'start_date_fixed', 'start_date');
    await queryRunner.renameColumn('products', 'end_date_fixed', 'end_date');
    await queryRunner.renameColumn('products', 'available_date_fixed', 'available_date');
  }
}
