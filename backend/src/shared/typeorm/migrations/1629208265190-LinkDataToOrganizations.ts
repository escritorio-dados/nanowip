import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

import { DEFAULT_ORGANIZATION_IDS } from '@modules/organizations/seeds/organizations.seeds';
import { DEFAULT_USER_ID } from '@modules/users/users/seeds/users.seeds';

export class LinkDataToOrganizations1629208265190 implements MigrationInterface {
  private async addColumn(queryRunner: QueryRunner, entity: string) {
    await queryRunner.addColumn(
      entity,
      new TableColumn({
        name: 'organization_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      entity,
      new TableForeignKey({
        name: `${entity}_to_organization`,
        columnNames: ['organization_id'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
  }

  private async updateNewColumn(queryRunner: QueryRunner, entity: string) {
    await queryRunner.changeColumn(
      entity,
      'organization_id',
      new TableColumn({
        name: 'organization_id',
        type: 'uuid',
        isNullable: false,
      }),
    );
  }

  private async seedNewColumn(queryRunner: QueryRunner, entity: string) {
    await queryRunner.query(
      `UPDATE ${entity} SET organization_id = '${DEFAULT_ORGANIZATION_IDS.UNASPRESS}'`,
    );
  }

  private async users(queryRunner: QueryRunner) {
    await this.addColumn(queryRunner, 'users');

    await this.seedNewColumn(queryRunner, 'users');

    // Atribuindo um valor diferente para o usuario raiz
    await queryRunner.query(
      `UPDATE users SET organization_id = '${DEFAULT_ORGANIZATION_IDS.SYSTEM}' WHERE id = '${DEFAULT_USER_ID}'`,
    );

    await this.updateNewColumn(queryRunner, 'users');
  }

  private async dropColumn(queryRunner: QueryRunner, entity: string) {
    await queryRunner.dropForeignKey(entity, `${entity}_to_organization`);

    await queryRunner.dropColumn(entity, 'organization_id');
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Usuarios
    await this.users(queryRunner);

    // Demais Entidades
    const entities = [
      'assignments',
      'collaborator_status',
      'collaborators',
      'costs',
      'customers',
      'measures',
      'portfolios',
      'product_types',
      'products',
      'project_types',
      'projects',
      'roles',
      'task_trails',
      'task_types',
      'tasks',
      'trackers',
      'trails',
      'value_chains',
    ];

    for await (const entity of entities) {
      await this.addColumn(queryRunner, entity);

      await this.seedNewColumn(queryRunner, entity);

      await this.updateNewColumn(queryRunner, entity);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const entities = [
      'assignments',
      'collaborator_status',
      'collaborators',
      'costs',
      'customers',
      'measures',
      'portfolios',
      'product_types',
      'products',
      'project_types',
      'projects',
      'roles',
      'task_trails',
      'task_types',
      'tasks',
      'trackers',
      'trails',
      'value_chains',
      'users',
    ];

    for await (const entity of entities) {
      await this.dropColumn(queryRunner, entity);
    }
  }
}
