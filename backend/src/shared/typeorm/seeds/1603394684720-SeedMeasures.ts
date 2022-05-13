import { In, MigrationInterface, QueryRunner } from 'typeorm';

import { Measure } from '@modules/measures/entities/Measure';
import measuresSeeds from '@modules/measures/seeds/measures.seeds';

export default class SeedMeasures1603394684720 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.connection.getRepository(Measure);

    const measures = repository.create(measuresSeeds);

    await repository.save(measures);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.connection.getRepository(Measure);

    const ids = measuresSeeds.map(({ id }) => id);

    const measuresToDelete = await repository.find({
      where: {
        id: In(ids),
      },
    });

    await repository.remove(measuresToDelete);
  }
}
