import { IsIn, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CollaboratorDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  jobTitle: string;

  @IsIn(['Interno', 'Externo'])
  @IsNotEmpty()
  type: 'Interno' | 'Externo';

  @IsOptional()
  @IsUUID()
  user_id?: string;
}
