import { Module } from '@nestjs/common';

import { CaslModule } from '@shared/providers/casl/casl.module';

import { LinksController } from './controllers/links.controller';
import { LinksServiceModule } from './links.service.module';

@Module({
  imports: [LinksServiceModule, CaslModule],
  controllers: [LinksController],
})
export class LinksModule {}
