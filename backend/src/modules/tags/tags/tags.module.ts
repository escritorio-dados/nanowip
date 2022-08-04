import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { TagsController } from './controllers/tags.controller';
import { TagsServiceModule } from './tags.service.module';

@Module({
  imports: [TagsServiceModule, CaslModule],
  controllers: [TagsController],
})
export class TagsModule {}
