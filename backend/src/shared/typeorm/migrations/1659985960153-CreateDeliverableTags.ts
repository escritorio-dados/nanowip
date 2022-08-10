import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateDeliverableTags1659985960153 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'deliverable_tags',
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
          },
          {
            name: 'deadline',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'objective_category_id',
            type: 'uuid',
          },
          {
            name: 'progress',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'goal',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'organization_id',
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
            name: `deliverable_tags_to_organization`,
            columnNames: ['organization_id'],
            referencedTableName: 'organizations',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
          {
            name: `deliverable_tags_to_objective_categories`,
            columnNames: ['objective_category_id'],
            referencedTableName: 'objective_categories',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'deliverable_tags_value_chains',
        columns: [
          {
            name: 'deliverable_tag_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'value_chain_id',
            type: 'uuid',
            isPrimary: true,
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
            name: `deliverable_tags_value_chains_to_deliverables`,
            columnNames: ['deliverable_tag_id'],
            referencedTableName: 'deliverable_tags',
            referencedColumnNames: ['id'],
            deferrable: 'DEFERRABLE',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            name: `deliverable_tags_value_chains_to_value_chains`,
            columnNames: ['value_chain_id'],
            referencedTableName: 'value_chains',
            referencedColumnNames: ['id'],
            deferrable: 'DEFERRABLE',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('deliverable_tags_value_chains');

    await queryRunner.dropTable('deliverable_tags');
  }
}
