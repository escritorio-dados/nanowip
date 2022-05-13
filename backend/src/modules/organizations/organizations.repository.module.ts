import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Organization } from './entities/Organization';
import { OrganizationsRepository } from './repositories/organizations.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  providers: [OrganizationsRepository],
  exports: [OrganizationsRepository],
})
export class OrganizationsRepositoryModule {}
