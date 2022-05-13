import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AjustTaskDates1621279868553 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Alterar nomes das datas já cadastradas
    await queryRunner.renameColumn('tasks', 'start_date', 'start_date_fixed');
    await queryRunner.renameColumn('tasks', 'end_date', 'end_date_fixed');

    // Criar Colunas das datas calculadas
    await queryRunner.addColumns('tasks', [
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
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Excluindo Datas calculadas
    await queryRunner.dropColumn('tasks', 'end_date_calc');
    await queryRunner.dropColumn('tasks', 'start_date_calc');

    // Voltando o nome das datas fixas ao normal
    await queryRunner.renameColumn('tasks', 'start_date_fixed', 'start_date');
    await queryRunner.renameColumn('tasks', 'end_date_fixed', 'end_date');
  }
}
