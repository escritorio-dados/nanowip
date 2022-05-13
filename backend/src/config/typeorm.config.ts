import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

config();

export const postgresConnection: TypeOrmModuleOptions = {
  type: 'postgres',
  port: Number(process.env.POSTGRESS_PORT),
  host: process.env.POSTGRESS_HOST,
  username: process.env.POSTGRESS_USER,
  password: process.env.POSTGRESS_PASSWORD,
  database: process.env.POSTGRESS_DATABASE,
};
