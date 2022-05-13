import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from './entities/Role';
import { RolesRepository } from './repositories/roles.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RolesRepository],
  exports: [RolesRepository],
})
export class RolesRepositoryModule {}
