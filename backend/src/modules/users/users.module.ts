import { Module } from '@nestjs/common';

import CaslModule from '@shared/providers/casl/casl.module';

import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { UsersServiceModule } from './users.service.module';

@Module({
  imports: [UsersServiceModule, CaslModule],
  controllers: [UsersController, AuthController],
})
export class UsersModule {}
