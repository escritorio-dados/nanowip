import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AjustValueChainDates1621251319342 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar Colunas das datas calculadas
    await queryRunner.addColumns('value_chains', [
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
    await queryRunner.dropColumn('value_chains', 'available_date_calc');
    await queryRunner.dropColumn('value_chains', 'end_date_calc');
    await queryRunner.dropColumn('value_chains', 'start_date_calc');
  }
}
