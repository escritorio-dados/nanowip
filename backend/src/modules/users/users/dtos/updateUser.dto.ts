import { ArrayMinSize, IsArray, IsEmail, IsIn, IsNotEmpty, IsOptional } from 'class-validator';

import { PermissionsUser } from '../enums/permissionsUser.enum';

export class UpdateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsOptional()
  password?: string;

  @IsArray()
  @IsIn(Object.values(PermissionsUser), { each: true })
  @ArrayMinSize(1)
  permissions: string[];
}
