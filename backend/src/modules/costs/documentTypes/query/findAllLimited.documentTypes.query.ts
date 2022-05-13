import { IsNotEmpty, IsOptional } from 'class-validator';

export class FindAllLimitedDocumentTypesQuery {
  @IsNotEmpty()
  @IsOptional()
  name?: string;
}
