import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { PermissionHandler } from '../types/permissionHandler.type';

export const CHECK_PERMISSIONS_KEY = 'check_permission';

export const CheckPermissions = (...handlers: PermissionHandler[]): CustomDecorator =>
  SetMetadata(CHECK_PERMISSIONS_KEY, handlers);
