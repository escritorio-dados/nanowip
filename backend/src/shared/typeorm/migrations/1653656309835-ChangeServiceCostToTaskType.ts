import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class ChangeServiceCostToTaskType1653656309835 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // drop columns service_id from cost_distributions
    await queryRunner.dropColumn('cost_distributions', 'service_id');

    // create column task_type_id in cost_distribution with relation to task_types
    await queryRunner.addColumn(
      'cost_distributions',
      new TableColumn({
        name: 'task_type_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'cost_distributions',
      new TableForeignKey({
        name: `cost_distributions_to_task_types`,
        columnNames: ['task_type_id'],
        referencedTableName: 'task_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    // drop table services
    await queryRunner.dropTable('services');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // create table services
    await queryRunner.createTable(
      new Table({
        name: 'services',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'organization_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: `services_to_organization`,
            columnNames: ['organization_id'],
            referencedTableName: 'organizations',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );

    // drop columns task_type_id from cost_distributions
    await queryRunner.dropColumn('cost_distributions', 'task_type_id');

    // create column service_id in cost_distribution with relation to services
    await queryRunner.addColumn(
      'cost_distributions',
      new TableColumn({
        name: 'service_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'cost_distributions',
      new TableForeignKey({
        name: `cost_distributions_to_services`,
        columnNames: ['service_id'],
        referencedTableName: 'services',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
  }
}
