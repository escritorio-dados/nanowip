import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { CHECK_PERMISSIONS_KEY } from '../decorators/checkPermissions.decorator';
import AbilityCaslFactory, { AppAbility } from '../factories/ability.casl.factory';
import { PermissionHandler } from '../types/permissionHandler.type';

@Injectable()
export default class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private abilityCaslFactory: AbilityCaslFactory) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PermissionHandler[]>(CHECK_PERMISSIONS_KEY, context.getHandler()) || [];

    const { user } = context.switchToHttp().getRequest();

    const ability = await this.abilityCaslFactory.createForUser(user);

    return policyHandlers.some(handler => this.execPermissionHandler(handler, ability));
  }

  private execPermissionHandler(handler: PermissionHandler, ability: AppAbility): boolean {
    if (typeof handler === 'function') {
      return handler(ability);
    }

    return handler.handle(ability);
  }
}
