import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class ChangeUserCollaborator1613054950174 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'collaborators',
      'user_id',
      new TableColumn({
        name: 'user_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.dropColumn('collaborators', 'has_timer_track');

    await queryRunner.addColumn(
      'collaborators',
      new TableColumn({
        name: 'type',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.query(`UPDATE collaborators SET type = 'Interno'`);

    await queryRunner.changeColumn(
      'collaborators',
      'type',
      new TableColumn({
        name: 'type',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('collaborators', 'type');

    await queryRunner.addColumn(
      'collaborators',
      new TableColumn({
        name: 'has_timer_track',
        type: 'boolean',
        isNullable: true,
      }),
    );

    await queryRunner.query(`UPDATE has_timer_track SET type = true`);

    await queryRunner.changeColumn(
      'collaborators',
      'has_timer_track',
      new TableColumn({
        name: 'has_timer_track',
        type: 'boolean',
        isNullable: false,
      }),
    );

    await queryRunner.changeColumn(
      'collaborators',
      'user_id',
      new TableColumn({
        name: 'user_id',
        type: 'uuid',
        isNullable: false,
      }),
    );
  }
}
