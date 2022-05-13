import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { PermissionHandler } from '../types/permissionHandler.type';

export const CHECK_PERMISSIONS_KEY = 'check_permission';

const CheckPermissions = (...handlers: PermissionHandler[]): CustomDecorator =>
  SetMetadata(CHECK_PERMISSIONS_KEY, handlers);

export default CheckPermissions;
