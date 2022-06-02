import { Injectable } from '@nestjs/common';

import { FindOneUserService } from '@modules/users/users/services/findOneUser.service';

import { CollaboratorDto } from '../dtos/collaborator.dto';
import { CollaboratorsRepository } from '../repositories/collaborators.repository';
import { ICreateCollaboratorRepository } from '../repositories/types';
import { CommonCollaboratorService } from './common.collaborator.service';

type ICreateCollaboratorService = CollaboratorDto & { organization_id: string };

@Injectable()
export class CreateCollaboratorService {
  constructor(
    private collaboratorsRepository: CollaboratorsRepository,
    private commonCollaboratorService: CommonCollaboratorService,
    private findOneUserService: FindOneUserService,
  ) {}

  async execute({ type, jobTitle, name, user_id, organization_id }: ICreateCollaboratorService) {
    const colaboratorToCreate = {
      organization_id,
      jobTitle,
      type,
    } as ICreateCollaboratorRepository;

    // Validando o usuario
    if (user_id) {
      colaboratorToCreate.user = await this.findOneUserService.execute({
        id: user_id,
        organization_id,
      });

      await this.commonCollaboratorService.validadeUserId(user_id);
    }

    // Validando o Nome
    await this.commonCollaboratorService.validadeName({ name, organization_id });

    colaboratorToCreate.name = name.trim();

    // Criando
    const collaborator = await this.collaboratorsRepository.create(colaboratorToCreate);

    return collaborator;
  }
}
