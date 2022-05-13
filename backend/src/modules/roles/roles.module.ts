import { Module } from '@nestjs/common';

import CaslModule from '@shared/providers/casl/casl.module';

import { RolesController } from './controllers/roles.controller';
import { RolesServiceModule } from './roles.service.module';

@Module({
  imports: [RolesServiceModule, CaslModule],
  controllers: [RolesController],
})
export class RolesModule {}
