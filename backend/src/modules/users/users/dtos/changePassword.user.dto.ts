import { IsNotEmpty } from 'class-validator';

export class ChangePasswordUserDto {
  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  newPassword: string;
}
