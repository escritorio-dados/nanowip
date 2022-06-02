import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { config } from 'dotenv';

import { HashModule } from '@shared/providers/hash/hash.module';

import { CollaboratorsServiceModule } from '@modules/collaborators/collaborators/collaborators.service.module';

import { JwtStrategy } from './providers/jwt.strategy';
import { AuthService } from './services/auth.service';
import { CommonUserService } from './services/commonUser.service';
import { CreateUserService } from './services/createUser.service';
import { DeleteUserService } from './services/deleteUser.service';
import { FindAllUserService } from './services/findAllUser.service';
import { FindOneUserService } from './services/findOneUser.service';
import { UpdateUserService } from './services/updateUser.service';
import { UsersRepositoryModule } from './users.repository.module';

config();

@Module({
  imports: [
    UsersRepositoryModule,
    HashModule,
    forwardRef(() => CollaboratorsServiceModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    CommonUserService,
    FindAllUserService,
    FindOneUserService,
    CreateUserService,
    UpdateUserService,
    DeleteUserService,
    AuthService,
    JwtStrategy,
  ],
  exports: [
    FindAllUserService,
    FindOneUserService,
    CreateUserService,
    UpdateUserService,
    DeleteUserService,
    AuthService,
    JwtStrategy,
  ],
})
export class UsersServiceModule {}
