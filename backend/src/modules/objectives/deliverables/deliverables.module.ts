import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { DeliverablesController } from './controllers/deliverables.controller';
import { DeliverablesServiceModule } from './deliverables.service.module';

@Module({
  imports: [DeliverablesServiceModule, CaslModule],
  controllers: [DeliverablesController],
})
export class DeliverablesModule {}
