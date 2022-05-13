import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateTrackers1610043760811 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'trackers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'collaborator_id',
            type: 'uuid',
          },
          {
            name: 'assignment_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'start',
            type: 'timestamp with time zone',
          },
          {
            name: 'end',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'varchar',
            isNullable: true,
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
            name: 'trackers_to_collaborators',
            columnNames: ['collaborator_id'],
            referencedTableName: 'collaborators',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
          {
            name: 'trackers_to_assignments',
            columnNames: ['assignment_id'],
            referencedTableName: 'assignments',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('trackers');
  }
}
