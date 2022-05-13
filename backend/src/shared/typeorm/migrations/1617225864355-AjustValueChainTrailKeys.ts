import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class AjustValueChainTrailKeys1617225864355 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('value_chain_trails', 'value_chain_trails_to_product_trails');

    await queryRunner.createForeignKey(
      'value_chain_trails',
      new TableForeignKey({
        name: 'value_chain_trails_to_product_trails',
        columnNames: ['product_trail_id'],
        referencedTableName: 'product_trails',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('value_chain_trails', 'value_chain_trails_to_product_trails');

    await queryRunner.createForeignKey(
      'value_chain_trails',
      new TableForeignKey({
        name: 'value_chain_trails_to_product_trails',
        columnNames: ['product_trail_id'],
        referencedTableName: 'product_trails',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
  }
}
