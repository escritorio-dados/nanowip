import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AppError } from '@shared/errors/AppError';

import { DEFAULT_ORGANIZATION_IDS } from '@modules/organizations/seeds/organizations.seeds';

import { AuthDto } from '../dtos/auth.dto';
import { User } from '../entities/User';
import { authErrors } from '../errors/auth.errors';
import { HashProvider } from '../providers/hash.provider';
import { IJwtPayload } from '../providers/jwt.strategy';
import { UsersRepository } from '../repositories/users.repository';

export type IAuthType = { user: User; token: string };

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private hashProvider: HashProvider,
    private jwtService: JwtService,
  ) {}

  private async getUserToken(user: User, selectedOrganizationId: string): Promise<string> {
    const payload: IJwtPayload = { email: user.email, sub: user.id };

    if (
      selectedOrganizationId !== user.organization_id &&
      user.organization_id === DEFAULT_ORGANIZATION_IDS.SYSTEM
    ) {
      payload.organization_id = selectedOrganizationId;
    } else {
      payload.organization_id = user.organization_id;
    }

    return this.jwtService.signAsync(payload);
  }

  async validadeUser({ email, password, organization_id }: AuthDto): Promise<IAuthType> {
    const user = await this.usersRepository.findByEmailLogin(email, organization_id);

    if (!user) {
      throw new AppError(authErrors.emailInvalid);
    }

    const validPassword = await this.hashProvider.compareHash(password, user.password);

    if (!validPassword) {
      throw new AppError(authErrors.passwordInvalid);
    }

    const token = await this.getUserToken(user, organization_id);

    return { token, user };
  }
}
