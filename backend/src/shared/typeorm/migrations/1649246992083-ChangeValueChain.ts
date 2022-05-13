import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class ChangeValueChain1649246992083 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('value_chains', 'position');

    await queryRunner.dropColumn('value_chains', 'value_chain_before_id');

    await queryRunner.renameColumn('value_chains', 'start_date_calc', 'start_date');
    await queryRunner.renameColumn('value_chains', 'end_date_calc', 'end_date');
    await queryRunner.renameColumn('value_chains', 'available_date_calc', 'available_date');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('value_chains', 'start_date', 'start_date_calc');
    await queryRunner.renameColumn('value_chains', 'end_date', 'end_date_calc');
    await queryRunner.renameColumn('value_chains', 'available_date', 'available_date_calc');

    await queryRunner.addColumn(
      'value_chains',
      new TableColumn({
        name: 'value_chain_before_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'value_chains',
      new TableForeignKey({
        name: 'value_chains_to_value_chains_before',
        columnNames: ['value_chain_before_id'],
        referencedTableName: 'value_chains',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.addColumn(
      'value_chains',
      new TableColumn({
        name: 'position',
        type: 'int',
        isNullable: true,
      }),
    );
  }
}
