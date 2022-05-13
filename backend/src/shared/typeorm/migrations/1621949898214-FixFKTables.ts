import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class FixFKTables1621949898214 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Arrumando projetos
    await queryRunner.dropForeignKey('projects', 'projects_to_customers');
    await queryRunner.dropForeignKey('projects', 'projects_to_projects');
    await queryRunner.dropForeignKey('projects', 'projects_to_project_types');

    await queryRunner.createForeignKeys('projects', [
      new TableForeignKey({
        name: 'projects_to_customers',
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'projects_to_projects',
        columnNames: ['project_parent_id'],
        referencedTableName: 'projects',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'projects_to_project_types',
        columnNames: ['project_type_id'],
        referencedTableName: 'project_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    ]);

    // Arrumando Produtos
    await queryRunner.dropForeignKey('products', 'products_to_projects');
    await queryRunner.dropForeignKey('products', 'products_to_products');
    await queryRunner.dropForeignKey('products', 'products_to_product_types');
    await queryRunner.dropForeignKey('products', 'products_to_measures');

    await queryRunner.createForeignKeys('products', [
      new TableForeignKey({
        name: 'products_to_projects',
        columnNames: ['project_id'],
        referencedTableName: 'projects',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'products_to_products',
        columnNames: ['product_parent_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'products_to_product_types',
        columnNames: ['product_type_id'],
        referencedTableName: 'product_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'products_to_measures',
        columnNames: ['measure_id'],
        referencedTableName: 'measures',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    ]);

    // Arrumando cadeia de valor
    await queryRunner.dropForeignKey('value_chains', 'value_chains_to_value_chains_before');
    await queryRunner.dropForeignKey('value_chains', 'value_chains_to_products');

    await queryRunner.createForeignKeys('value_chains', [
      new TableForeignKey({
        name: 'value_chains_to_value_chains_before',
        columnNames: ['value_chain_before_id'],
        referencedTableName: 'value_chains',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'value_chains_to_products',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    ]);

    // Arrumando Tarefas
    await queryRunner.dropForeignKey('tasks', 'tasks_to_task_types');
    await queryRunner.dropForeignKey('tasks', 'tasks_to_task_before');
    await queryRunner.dropForeignKey('tasks', 'tasks_to_value_chains');

    await queryRunner.createForeignKeys('tasks', [
      new TableForeignKey({
        name: 'tasks_to_task_types',
        columnNames: ['task_type_id'],
        referencedTableName: 'task_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'tasks_to_task_before',
        columnNames: ['task_before_id'],
        referencedTableName: 'tasks',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'tasks_to_value_chains',
        columnNames: ['value_chain_id'],
        referencedTableName: 'value_chains',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    ]);

    // Arrumando Colaboradores
    await queryRunner.dropForeignKey('collaborators', 'collaborators_to_users');

    await queryRunner.createForeignKeys('collaborators', [
      new TableForeignKey({
        name: 'collaborators_to_users',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    ]);

    // Arrumando Status Colaborador
    await queryRunner.dropForeignKey('collaborator_status', 'collaborator_status_to_collaborators');

    await queryRunner.createForeignKeys('collaborator_status', [
      new TableForeignKey({
        name: 'collaborator_status_to_collaborators',
        columnNames: ['collaborator_id'],
        referencedTableName: 'collaborators',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    ]);

    // Arrumando Trackers
    await queryRunner.dropForeignKey('trackers', 'trackers_to_collaborators');
    await queryRunner.dropForeignKey('trackers', 'trackers_to_assignments');

    await queryRunner.createForeignKeys('trackers', [
      new TableForeignKey({
        name: 'trackers_to_collaborators',
        columnNames: ['collaborator_id'],
        referencedTableName: 'collaborators',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'trackers_to_assignments',
        columnNames: ['assignment_id'],
        referencedTableName: 'assignments',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    ]);

    // Arrumando TaskTrails
    await queryRunner.dropForeignKey('task_trails', 'task_trails_to_trails');
    await queryRunner.dropForeignKey('task_trails', 'task_trails_to_task_types');
    await queryRunner.dropForeignKey('task_trails', 'task_trails_to_task_before');

    await queryRunner.createForeignKeys('task_trails', [
      new TableForeignKey({
        name: 'task_trails_to_trails',
        columnNames: ['trail_id'],
        referencedTableName: 'trails',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'task_trails_to_task_types',
        columnNames: ['task_type_id'],
        referencedTableName: 'task_types',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'task_trails_to_task_before',
        columnNames: ['task_before_id'],
        referencedTableName: 'task_trails',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    ]);

    // Arrumando Portfolio Projects
    await queryRunner.dropForeignKey('portfolios_projects', 'portfolios_projects_to_portfolios');
    await queryRunner.dropForeignKey('portfolios_projects', 'portfolios_projects_to_projects');

    await queryRunner.createForeignKeys('portfolios_projects', [
      new TableForeignKey({
        name: 'portfolios_projects_to_portfolios',
        columnNames: ['portfolio_id'],
        referencedTableName: 'portfolios',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'portfolios_projects_to_projects',
        columnNames: ['project_id'],
        referencedTableName: 'projects',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    ]);

    // Arrumando Custos
    await queryRunner.dropForeignKey('costs', 'costs_to_projects');
    await queryRunner.dropForeignKey('costs', 'costs_to_products');
    await queryRunner.dropForeignKey('costs', 'costs_to_tasks');

    await queryRunner.createForeignKeys('costs', [
      new TableForeignKey({
        name: 'costs_to_projects',
        columnNames: ['project_id'],
        referencedTableName: 'projects',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'costs_to_products',
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'costs_to_tasks',
        columnNames: ['task_id'],
        referencedTableName: 'tasks',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.up(queryRunner);
  }
}
