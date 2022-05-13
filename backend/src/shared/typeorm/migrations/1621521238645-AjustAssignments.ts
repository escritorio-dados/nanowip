import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AjustAssignments1621521238645 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar Colunas das datas calculadas
    await queryRunner.addColumns('assignments', [
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

    // Excluindo a coluna need validations
    await queryRunner.dropColumn('assignments', 'need_validation');

    // Alterando qualquer status de Validado para Fechado
    await queryRunner.query("UPDATE assignments SET status = 'Fechado' WHERE status = 'Validado'");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Excluindo as colunas calculadas
    await queryRunner.dropColumn('assignments', 'end_date_calc');
    await queryRunner.dropColumn('assignments', 'start_date_calc');

    // Recriando coluna need validation
    await queryRunner.addColumn(
      'assignments',
      new TableColumn({
        name: 'need_validation',
        type: 'boolean',
        default: false,
      }),
    );
  }
}
