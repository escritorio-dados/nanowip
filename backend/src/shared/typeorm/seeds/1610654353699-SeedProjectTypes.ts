import { In, MigrationInterface, QueryRunner } from 'typeorm';

import { ProjectType } from '@modules/projectTypes/entities/ProjectType';
import projectTypesSeeds from '@modules/projectTypes/seeds/projectType.seeds';

export default class SeedProjectTypes1610654353699 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.connection.getRepository(ProjectType);

    const projectTypes = repository.create(projectTypesSeeds);

    await repository.save(projectTypes);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.connection.getRepository(ProjectType);

    const ids = projectTypesSeeds.map(({ id }) => id);

    const projectTypesToDelete = await repository.find({
      where: {
        id: In(ids),
      },
    });

    await repository.remove(projectTypesToDelete);
  }
}
