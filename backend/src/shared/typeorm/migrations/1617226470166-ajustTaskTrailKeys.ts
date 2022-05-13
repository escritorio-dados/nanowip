import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class ajustTaskTrailKeys1617226470166 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('task_trails', 'task_trails_to_value_chain_trails');

    await queryRunner.createForeignKey(
      'task_trails',
      new TableForeignKey({
        name: 'task_trails_to_value_chain_trails',
        columnNames: ['value_chain_trail_id'],
        referencedTableName: 'value_chain_trails',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('task_trails', 'task_trails_to_value_chain_trails');

    await queryRunner.createForeignKey(
      'task_trails',
      new TableForeignKey({
        name: 'task_trails_to_value_chain_trails',
        columnNames: ['value_chain_trail_id'],
        referencedTableName: 'value_chain_trails',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
  }
}
