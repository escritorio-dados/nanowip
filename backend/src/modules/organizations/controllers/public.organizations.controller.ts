import { Controller, Get } from '@nestjs/common';

import { Public } from '@shared/providers/auth/decorators/public.decorator';

import { FindAllOrganizationService } from '../services/findAll.organization.service';

@Public()
@Controller('organizations')
export class PublicOrganizationsController {
  constructor(private findAllOrganizationService: FindAllOrganizationService) {}

  @Get('public')
  async listOrganizations() {
    return this.findAllOrganizationService.findPublic();
  }
}
