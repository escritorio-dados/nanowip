import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateCollaboratorStatus1609791323613 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'collaborator_status',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'salary',
            type: 'numeric',
          },
          {
            name: 'month_hours',
            type: 'float',
          },
          {
            name: 'date',
            type: 'timestamp with time zone',
          },
          {
            name: 'collaborator_id',
            type: 'uuid',
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
            name: 'collaborator_status_to_collaborators',
            columnNames: ['collaborator_id'],
            referencedTableName: 'collaborators',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'unique_collaborator_status',
            columnNames: ['date', 'collaborator_id'],
            isUnique: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('collaborator_status');
  }
}
