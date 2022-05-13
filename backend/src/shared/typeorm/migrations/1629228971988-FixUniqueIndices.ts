import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class FixUniqueIndices1629228971988 implements MigrationInterface {
  private async fixCustomers(queryRunner: QueryRunner, operation: 'up' | 'down') {
    if (operation === 'up') {
      await queryRunner.query(
        'ALTER TABLE customers DROP CONSTRAINT IF EXISTS "UQ_b942d55b92ededa770041db9ded"',
      );

      await queryRunner.query('DROP INDEX IF EXISTS "UQ_b942d55b92ededa770041db9ded"');

      await queryRunner.query('DROP INDEX IF EXISTS "unique_customer"');

      await queryRunner.createIndex(
        'customers',
        new TableIndex({
          isUnique: true,
          columnNames: ['name', 'organization_id'],
          name: 'unique_customer',
        }),
      );
    } else {
      await queryRunner.dropIndex('customers', 'unique_customer');

      await queryRunner.createIndex(
        'customers',
        new TableIndex({
          isUnique: true,
          columnNames: ['name'],
          name: 'unique_customer',
        }),
      );
    }
  }

  private async fixMeasures(queryRunner: QueryRunner, operation: 'up' | 'down') {
    if (operation === 'up') {
      await queryRunner.query(
        'ALTER TABLE measures DROP CONSTRAINT IF EXISTS "UQ_46cca80d38c98955000b88d6b34"',
      );

      await queryRunner.query('DROP INDEX IF EXISTS "UQ_46cca80d38c98955000b88d6b34"');

      await queryRunner.query('DROP INDEX IF EXISTS "unique_measure"');

      await queryRunner.createIndex(
        'measures',
        new TableIndex({
          isUnique: true,
          columnNames: ['name', 'organization_id'],
          name: 'unique_measure',
        }),
      );
    } else {
      await queryRunner.dropIndex('measures', 'unique_measure');

      await queryRunner.createIndex(
        'measures',
        new TableIndex({
          isUnique: true,
          columnNames: ['name'],
          name: 'unique_measure',
        }),
      );
    }
  }

  private async fixPortfolios(queryRunner: QueryRunner, operation: 'up' | 'down') {
    if (operation === 'up') {
      await queryRunner.query(
        'ALTER TABLE portfolios DROP CONSTRAINT IF EXISTS "UQ_29f7b2bcfa0d26fa6699015037f"',
      );

      await queryRunner.query('DROP INDEX IF EXISTS "UQ_29f7b2bcfa0d26fa6699015037f"');

      await queryRunner.query('DROP INDEX IF EXISTS "unique_portfolio"');

      await queryRunner.createIndex(
        'portfolios',
        new TableIndex({
          isUnique: true,
          columnNames: ['name', 'organization_id'],
          name: 'unique_portfolio',
        }),
      );
    } else {
      await queryRunner.dropIndex('portfolios', 'unique_portfolio');

      await queryRunner.createIndex(
        'portfolios',
        new TableIndex({
          isUnique: true,
          columnNames: ['name'],
          name: 'unique_portfolio',
        }),
      );
    }
  }

  private async fixProductTypes(queryRunner: QueryRunner, operation: 'up' | 'down') {
    if (operation === 'up') {
      await queryRunner.query(
        'ALTER TABLE product_types DROP CONSTRAINT IF EXISTS "UQ_2b3bfea1c7797e9d067dfc3c7a0"',
      );

      await queryRunner.query('DROP INDEX IF EXISTS "UQ_2b3bfea1c7797e9d067dfc3c7a0"');

      await queryRunner.query('DROP INDEX IF EXISTS "unique_product_type"');

      await queryRunner.createIndex(
        'product_types',
        new TableIndex({
          isUnique: true,
          columnNames: ['name', 'organization_id'],
          name: 'unique_product_type',
        }),
      );
    } else {
      await queryRunner.dropIndex('product_types', 'unique_product_type');

      await queryRunner.createIndex(
        'product_types',
        new TableIndex({
          isUnique: true,
          columnNames: ['name'],
          name: 'unique_product_type',
        }),
      );
    }
  }

  private async fixProjectTypes(queryRunner: QueryRunner, operation: 'up' | 'down') {
    if (operation === 'up') {
      await queryRunner.query(
        'ALTER TABLE project_types DROP CONSTRAINT IF EXISTS "UQ_5a37fd626e36a64a14e1b0ec705"',
      );

      await queryRunner.query('DROP INDEX IF EXISTS "UQ_5a37fd626e36a64a14e1b0ec705"');

      await queryRunner.query('DROP INDEX IF EXISTS "unique_project_type"');

      await queryRunner.createIndex(
        'project_types',
        new TableIndex({
          isUnique: true,
          columnNames: ['name', 'organization_id'],
          name: 'unique_project_type',
        }),
      );
    } else {
      await queryRunner.dropIndex('project_types', 'unique_project_type');

      await queryRunner.createIndex(
        'project_types',
        new TableIndex({
          isUnique: true,
          columnNames: ['name'],
          name: 'unique_project_type',
        }),
      );
    }
  }

  private async fixRoles(queryRunner: QueryRunner, operation: 'up' | 'down') {
    if (operation === 'up') {
      await queryRunner.query(
        'ALTER TABLE roles DROP CONSTRAINT IF EXISTS "UQ_648e3f5447f725579d7d4ffdfb7"',
      );

      await queryRunner.query('DROP INDEX IF EXISTS "UQ_648e3f5447f725579d7d4ffdfb7"');

      await queryRunner.query('DROP INDEX IF EXISTS "unique_role"');

      await queryRunner.createIndex(
        'roles',
        new TableIndex({
          isUnique: true,
          columnNames: ['name', 'organization_id'],
          name: 'unique_role',
        }),
      );
    } else {
      await queryRunner.dropIndex('roles', 'unique_role');

      await queryRunner.createIndex(
        'roles',
        new TableIndex({
          isUnique: true,
          columnNames: ['name'],
          name: 'unique_role',
        }),
      );
    }
  }

  private async fixTaskType(queryRunner: QueryRunner, operation: 'up' | 'down') {
    if (operation === 'up') {
      await queryRunner.query(
        'ALTER TABLE task_types DROP CONSTRAINT IF EXISTS "UQ_82231175ab7d4a8acd363eae667"',
      );

      await queryRunner.query('DROP INDEX IF EXISTS "UQ_82231175ab7d4a8acd363eae667"');

      await queryRunner.query('DROP INDEX IF EXISTS "unique_task_type"');

      await queryRunner.createIndex(
        'task_types',
        new TableIndex({
          isUnique: true,
          columnNames: ['name', 'organization_id'],
          name: 'unique_task_type',
        }),
      );
    } else {
      await queryRunner.dropIndex('task_types', 'unique_task_type');

      await queryRunner.createIndex(
        'task_types',
        new TableIndex({
          isUnique: true,
          columnNames: ['name'],
          name: 'unique_task_type',
        }),
      );
    }
  }

  private async fixTrails(queryRunner: QueryRunner, operation: 'up' | 'down') {
    if (operation === 'up') {
      await queryRunner.query(
        'ALTER TABLE trails DROP CONSTRAINT IF EXISTS "UQ_2c53b2c72f277c4872d3de020c5"',
      );

      await queryRunner.query('DROP INDEX IF EXISTS "UQ_2c53b2c72f277c4872d3de020c5"');

      await queryRunner.query('DROP INDEX IF EXISTS "unique_trails"');

      await queryRunner.createIndex(
        'trails',
        new TableIndex({
          isUnique: true,
          columnNames: ['name', 'organization_id'],
          name: 'unique_trails',
        }),
      );
    } else {
      await queryRunner.dropIndex('trails', 'unique_trails');

      await queryRunner.createIndex(
        'trails',
        new TableIndex({
          isUnique: true,
          columnNames: ['name'],
          name: 'unique_trails',
        }),
      );
    }
  }

  private async fixUser(queryRunner: QueryRunner, operation: 'up' | 'down') {
    if (operation === 'up') {
      await queryRunner.query(
        'ALTER TABLE users DROP CONSTRAINT IF EXISTS "UQ_97672ac88f789774dd47f7c8be3"',
      );

      await queryRunner.query('DROP INDEX IF EXISTS "UQ_97672ac88f789774dd47f7c8be3"');

      await queryRunner.query('DROP INDEX IF EXISTS "unique_user"');

      await queryRunner.createIndex(
        'users',
        new TableIndex({
          isUnique: true,
          columnNames: ['email', 'organization_id'],
          name: 'unique_user',
        }),
      );
    } else {
      await queryRunner.dropIndex('users', 'unique_user');

      await queryRunner.createIndex(
        'users',
        new TableIndex({
          isUnique: true,
          columnNames: ['email'],
          name: 'unique_user',
        }),
      );
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Usuarios
    await this.fixUser(queryRunner, 'up');

    // Clientes
    await this.fixCustomers(queryRunner, 'up');

    // Unidades de Medidas
    await this.fixMeasures(queryRunner, 'up');

    // Portfolios
    await this.fixPortfolios(queryRunner, 'up');

    // Tipo de Produto
    await this.fixProductTypes(queryRunner, 'up');

    // Tipo de Projeto
    await this.fixProjectTypes(queryRunner, 'up');

    // Papeis
    await this.fixRoles(queryRunner, 'up');

    // Tipo de tarefa
    await this.fixTaskType(queryRunner, 'up');

    // Trilhas
    await this.fixTrails(queryRunner, 'up');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Usuarios
    await this.fixUser(queryRunner, 'down');

    // Clientes
    await this.fixCustomers(queryRunner, 'down');

    // Unidades de Medidas
    await this.fixMeasures(queryRunner, 'down');

    // Portfolios
    await this.fixPortfolios(queryRunner, 'down');

    // Tipo de Produto
    await this.fixProductTypes(queryRunner, 'down');

    // Tipo de Projeto
    await this.fixProjectTypes(queryRunner, 'down');

    // Papeis
    await this.fixRoles(queryRunner, 'down');

    // Tipo de tarefa
    await this.fixTaskType(queryRunner, 'down');

    // Trilhas
    await this.fixTrails(queryRunner, 'down');
  }
}
