import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
// import * as redisStore from 'cache-manager-redis-store';
import { config } from 'dotenv';

import { JwtAuthGuard } from '@shared/providers/auth/guards/jwtAuth.guard';

import { postgresConnection } from './typeorm.config';

config();

@Module({
  imports: [
    // Typeorm
    TypeOrmModule.forRoot({
      ...postgresConnection,
      autoLoadEntities: true,
    }),

    // Caching
    // CacheModule.register<RedisClientOpts>({
    //   isGlobal: true,
    //   store: redisStore,
    //   host: process.env.REDIS_HOST,
    //   port: Number(process.env.REDIS_PORT),
    // }),
  ],
  providers: [
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class ConfigModule {}
