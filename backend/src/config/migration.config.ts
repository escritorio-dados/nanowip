import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { postgresConnection } from './typeorm.config';

const typeormConfig: TypeOrmModuleOptions[] = [
  {
    ...postgresConnection,
    migrations: ['./src/shared/typeorm/migrations/*.ts'],
    cli: {
      migrationsDir: './src/shared/typeorm/migrations',
    },
    entities: ['./src/**/entities/*.ts', './src/shared/typeorm/oldClasses/*.ts'],
  },
  {
    ...postgresConnection,
    name: 'seeds',
    migrations: ['./src/shared/typeorm/seeds/*.ts'],
    cli: {
      migrationsDir: './src/shared/typeorm/seeds',
    },
    entities: ['./src/**/entities/*.ts'],
  },
];

export = typeormConfig;
