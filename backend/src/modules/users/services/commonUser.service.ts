import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';
import { validateOrganization } from '@shared/utils/validateOrganization';

import { DEFAULT_ORGANIZATION_IDS } from '@modules/organizations/seeds/organizations.seeds';

import { User } from '../entities/User';
import { userErrors } from '../errors/user.errors';
import { UsersRepository } from '../repositories/users.repository';

type IValidateEmail = { email: string; organization_id: string };

type IGetUser = {
  id: string;
  organization_id: string;
  relations?: string[];
  ignore_organizations?: boolean;
};

@Injectable()
export class CommonUserService {
  constructor(private usersRepository: UsersRepository) {}

  async validadeEmail({ email, organization_id }: IValidateEmail): Promise<void> {
    const userAcross = await this.usersRepository.findByEmailAcross(email);

    // Criando no Nanowip com um email já utilizado em outra organização
    if (
      organization_id === DEFAULT_ORGANIZATION_IDS.SYSTEM &&
      userAcross &&
      userAcross.organization_id !== DEFAULT_ORGANIZATION_IDS.SYSTEM
    ) {
      throw new AppError(userErrors.reservedEmailSystem);
    }

    if (organization_id !== DEFAULT_ORGANIZATION_IDS.SYSTEM) {
      // Criando um usuario em uma organização com um email já registrado no Nanowip
      if (userAcross && userAcross.organization_id === DEFAULT_ORGANIZATION_IDS.SYSTEM) {
        throw new AppError(userErrors.reservedEmailOthers);
      }

      // Criando um usuario na mesma organização com o mesmo e-mail
      const userWithSameName = await this.usersRepository.findByEmail(email, organization_id);

      if (userWithSameName) {
        throw new AppError(userErrors.duplicateEmail);
      }
    }
  }

  async getUser({ id, organization_id, relations, ignore_organizations }: IGetUser): Promise<User> {
    const user = await this.usersRepository.findById(id, relations);

    if (!user) {
      throw new AppError(userErrors.notFound);
    }

    if (!ignore_organizations) {
      validateOrganization({ entity: user, organization_id });
    }

    return user;
  }
}
