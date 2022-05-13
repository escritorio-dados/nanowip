import { Injectable } from '@nestjs/common';

import { CreateUserDto } from '../dtos/createUser.dto';
import { User } from '../entities/User';
import { HashProvider } from '../providers/hash.provider';
import { UsersRepository } from '../repositories/users.repository';
import { fixPermissions } from '../utils/fixPermissions';
import { CommonUserService } from './commonUser.service';

type ICreateUser = CreateUserDto & { organization_id: string };

@Injectable()
export class CreateUserService {
  constructor(
    private usersRepository: UsersRepository,
    private commonUserService: CommonUserService,
    private hashProvider: HashProvider,
  ) {}

  async execute({
    email,
    name,
    password,
    permissions,
    organization_id,
  }: ICreateUser): Promise<User> {
    // Validando se já existe um email cadastrado na organização
    await this.commonUserService.validadeEmail({
      email,
      organization_id,
    });

    // Gerando um Hash Da senha
    const hashedPassword = await this.hashProvider.generateHash(password);

    // Corrigindo possiveis erros na atribuição de permissões
    const fixedPermissions = fixPermissions(permissions);

    // Criando o usuario
    const user = await this.usersRepository.create({
      email,
      name,
      password: hashedPassword,
      permissions: fixedPermissions,
      organization_id,
    });

    return user;
  }
}
