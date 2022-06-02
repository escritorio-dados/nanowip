import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { config } from 'dotenv';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppError } from '@shared/errors/AppError';

import { UsersRepository } from '../repositories/users.repository';

config();

export type IJwtPayload = {
  sub: string;
  email: string;
  organization_id?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: IJwtPayload) {
    const user = await this.usersRepository.findById(payload.sub, ['collaborator']);

    if (!user) {
      throw new AppError({ message: 'unauthorized', statusCode: 401 });
    }

    if (payload.organization_id) {
      user.organization_id = payload.organization_id;
    }

    return user;
  }
}
