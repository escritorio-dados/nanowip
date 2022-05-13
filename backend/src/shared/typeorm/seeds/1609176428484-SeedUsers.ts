import { In, MigrationInterface, QueryRunner } from 'typeorm';

import { User } from '@modules/users/entities/User';
import { usersSeeds } from '@modules/users/seeds/users.seeds';

export default class SeedUsers1609176428484 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.connection.getRepository(User);

    const users = repository.create(usersSeeds);

    await repository.save(users);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.connection.getRepository(User);

    const ids = usersSeeds.map(({ id }) => id);

    const usersToDelete = await repository.find({
      where: {
        id: In(ids),
      },
    });

    await repository.remove(usersToDelete);
  }
}
