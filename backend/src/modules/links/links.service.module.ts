import { Module } from '@nestjs/common';

import { LinksRepositoryModule } from './links.repository.module';
import { CommonLinkService } from './services/common.link.service';
import { CreateLinkService } from './services/create.link.service';
import { DeleteLinkService } from './services/delete.link.service';
import { FindAllLinkService } from './services/findAll.link.service';
import { FindOneLinkService } from './services/findOne.link.service';
import { UpdateLinkService } from './services/update.link.service';

@Module({
  imports: [LinksRepositoryModule],
  providers: [
    CommonLinkService,
    FindAllLinkService,
    FindOneLinkService,
    CreateLinkService,
    UpdateLinkService,
    DeleteLinkService,
  ],
  exports: [
    FindAllLinkService,
    FindOneLinkService,
    CreateLinkService,
    UpdateLinkService,
    DeleteLinkService,
  ],
})
export class LinksServiceModule {}
