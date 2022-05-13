import { Injectable } from '@nestjs/common';

import { AppError } from '@shared/errors/AppError';

import { userErrors } from '../errors/user.errors';
import { UsersRepository } from '../repositories/users.repository';
import { DEFAULT_USER_ID } from '../seeds/users.seeds';
import { CommonUserService } from './commonUser.service';

type IDeleteUser = { id: string; organization_id: string };

@Injectable()
export class DeleteUserService {
  constructor(
    private usersRepository: UsersRepository,
    private commonUserService: CommonUserService,
  ) {}

  async execute({ id, organization_id }: IDeleteUser) {
    if (id === DEFAULT_USER_ID) {
      throw new AppError(userErrors.cannotBeDeleted);
    }

    const user = await this.commonUserService.getUser({
      id,
      relations: ['collaborator'],
      organization_id,
    });

    // Impedindo de um usuario com colaborador sem excluido
    if (user.collaborator) {
      throw new AppError(userErrors.deleteWithCollaborator);
    }

    await this.usersRepository.delete(user);
  }
}
