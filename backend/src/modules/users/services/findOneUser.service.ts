import { Injectable } from '@nestjs/common';

import { User } from '../entities/User';
import { CommonUserService } from './commonUser.service';

type IFindOneUserService = { id: string; organization_id: string };

@Injectable()
export class FindOneUserService {
  constructor(private commonUserService: CommonUserService) {}

  async execute({ id, organization_id }: IFindOneUserService): Promise<User> {
    const user = await this.commonUserService.getUser({ id, organization_id });

    return user;
  }
}
