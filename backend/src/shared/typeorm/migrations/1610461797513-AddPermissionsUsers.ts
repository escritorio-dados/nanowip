import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

import { PermissionsUser } from '@modules/users/users/enums/permissionsUser.enum';

export default class AddPermissionsUsers1610461797513 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'permissions',
        type: 'varchar',
        isArray: true,
        isNullable: true,
      }),
    );

    await queryRunner.query(`UPDATE users SET permissions = '{${[PermissionsUser.admin]}}'`);

    await queryRunner.changeColumn(
      'users',
      'permissions',
      new TableColumn({ name: 'permissions', type: 'varchar', isArray: true, isNullable: false }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'permissions');
  }
}
