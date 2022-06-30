import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class LinkValueChainsWithDeliverables1656415683559 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'deliverables_value_chains',
        columns: [
          {
            name: 'deliverable_id',
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
            name: `deliverables_value_chains_to_deliverables`,
            columnNames: ['deliverable_id'],
            referencedTableName: 'deliverables',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            name: `deliverables_value_chains_to_value_chains`,
            columnNames: ['value_chain_id'],
            referencedTableName: 'value_chains',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('deliverables_value_chains');
  }
}
