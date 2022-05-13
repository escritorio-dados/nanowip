import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreatePortfoliosProjects1611070457895 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'portfolios_projects',
        columns: [
          {
            name: 'portfolio_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'project_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'portfolios_projects_to_portfolios',
            columnNames: ['portfolio_id'],
            referencedTableName: 'portfolios',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            name: 'portfolios_projects_to_projects',
            columnNames: ['project_id'],
            referencedTableName: 'projects',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('portfolios_projects');
  }
}
