import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { DeliverableTagsController } from './controllers/deliverableTags.controller';
import { DeliverableTagsServiceModule } from './deliverableTags.service.module';

@Module({
  imports: [DeliverableTagsServiceModule, CaslModule],
  controllers: [DeliverableTagsController],
})
export class DeliverableTagsModule {}
