import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Param,
  Post,
  Body,
  Put,
  HttpCode,
  Delete,
} from '@nestjs/common';

import { CheckPermissions } from '@shared/providers/casl/decorators/checkPermissions.decorator';
import { CaslActions } from '@shared/providers/casl/enums/actions.casl.enum';
import { PermissionsGuard } from '@shared/providers/casl/guards/Permission.guard';
import { IParamId } from '@shared/types/params';
import { ICurrentUser } from '@shared/types/request';

import { DocumentTypeDto } from '../dtos/documentType.dto';
import { DocumentTypeCost } from '../entities/DocumentType';
import { FindAllLimitedDocumentTypesQuery } from '../query/findAllLimited.documentTypes.query';
import { FindAllPaginationDocumentTypesQuery } from '../query/findAllPagination.documentTypes.query';
import { CreateDocumentTypeService } from '../services/create.documentType.service';
import { DeleteDocumentTypeService } from '../services/delete.documentType.service';
import { FindAllDocumentTypeService } from '../services/findAll.documentType.service';
import { FindOneDocumentTypeService } from '../services/findOne.documentType.service';
import { UpdateDocumentTypeService } from '../services/update.documentType.service';

@Controller('document_types')
export class DocumentTypesController {
  constructor(
    private findAllDocumentTypeService: FindAllDocumentTypeService,
    private findOneDocumentTypeService: FindOneDocumentTypeService,
    private createDocumentTypeService: CreateDocumentTypeService,
    private updateDocumentTypeService: UpdateDocumentTypeService,
    private deleteDocumentTypeService: DeleteDocumentTypeService,
  ) {}

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, DocumentTypeCost))
  @Get()
  async findAllPagination(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllPaginationDocumentTypesQuery,
  ) {
    return this.findAllDocumentTypeService.findAllPagination({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, DocumentTypeCost))
  @Get('/limited')
  async findAllLimited(
    @Request() { user }: ICurrentUser,
    @Query() query: FindAllLimitedDocumentTypesQuery,
  ) {
    return this.findAllDocumentTypeService.findAllLimited({
      organization_id: user.organization_id,
      query,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.read, DocumentTypeCost))
  @Get(':id')
  async get(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    return this.findOneDocumentTypeService.getInfo({
      id,
      organization_id: user.organization_id,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.create, DocumentTypeCost))
  @Post()
  async create(@Body() input: DocumentTypeDto, @Request() { user }: ICurrentUser) {
    return this.createDocumentTypeService.execute({
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.update, DocumentTypeCost))
  @Put(':id')
  async update(
    @Param() { id }: IParamId,
    @Body() input: DocumentTypeDto,
    @Request() { user }: ICurrentUser,
  ) {
    return this.updateDocumentTypeService.execute({
      id,
      organization_id: user.organization_id,
      ...input,
    });
  }

  @UseGuards(PermissionsGuard)
  @CheckPermissions(ability => ability.can(CaslActions.delete, DocumentTypeCost))
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param() { id }: IParamId, @Request() { user }: ICurrentUser) {
    await this.deleteDocumentTypeService.execute({
      id,
      organization_id: user.organization_id,
    });
  }
}
