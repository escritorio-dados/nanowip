import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AjustProjectDates1620841760704 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Alterar nomes das datas já cadastradas
    await queryRunner.renameColumn('projects', 'start_date', 'start_date_fixed');
    await queryRunner.renameColumn('projects', 'end_date', 'end_date_fixed');
    await queryRunner.renameColumn('projects', 'available_date', 'available_date_fixed');

    // Criar Colunas das datas calculadas
    await queryRunner.addColumns('projects', [
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
    await queryRunner.dropColumn('projects', 'available_date_calc');
    await queryRunner.dropColumn('projects', 'end_date_calc');
    await queryRunner.dropColumn('projects', 'start_date_calc');

    // Voltando o nome das datas fixas ao normal
    await queryRunner.renameColumn('projects', 'start_date_fixed', 'start_date');
    await queryRunner.renameColumn('projects', 'end_date_fixed', 'end_date');
    await queryRunner.renameColumn('projects', 'available_date_fixed', 'available_date');
  }
}
