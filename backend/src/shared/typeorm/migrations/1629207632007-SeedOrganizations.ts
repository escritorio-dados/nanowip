import { In, MigrationInterface, QueryRunner } from 'typeorm';

import { Organization } from '@modules/organizations/entities/Organization';
import { organizationsSeeds } from '@modules/organizations/seeds/organizations.seeds';

export class SeedOrganizations1629207632007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.connection.getRepository(Organization);

    const organizations = repository.create(organizationsSeeds);

    await repository.save(organizations);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.connection.getRepository(Organization);

    const ids = organizationsSeeds.map(({ id }) => id);

    const organizationsToDelete = await repository.find({
      where: {
        id: In(ids),
      },
    });

    await repository.remove(organizationsToDelete);
  }
}
