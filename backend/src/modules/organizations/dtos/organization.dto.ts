import { IsNotEmpty } from 'class-validator';

export class OrganizationDto {
  @IsNotEmpty()
  name: string;
}
