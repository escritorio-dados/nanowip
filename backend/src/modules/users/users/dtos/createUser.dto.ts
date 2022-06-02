import { ArrayMinSize, IsArray, IsEmail, IsIn, IsNotEmpty } from 'class-validator';

import { PermissionsUser } from '../enums/permissionsUser.enum';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsArray()
  @IsIn(Object.values(PermissionsUser), { each: true })
  @ArrayMinSize(1)
  permissions: string[];
}
