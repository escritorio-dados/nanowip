import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsUUID()
  organization_id: string;
}
