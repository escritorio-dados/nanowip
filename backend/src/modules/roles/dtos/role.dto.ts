import { ArrayMinSize, IsArray, IsIn, IsNotEmpty } from 'class-validator';

import { PermissionsUser } from '@modules/users/enums/permissionsUser.enum';

export class RoleDto {
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsIn(Object.values(PermissionsUser), { each: true })
  @ArrayMinSize(1)
  permissions: string[];
}
