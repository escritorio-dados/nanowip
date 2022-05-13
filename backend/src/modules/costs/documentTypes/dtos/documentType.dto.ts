import { IsNotEmpty } from 'class-validator';

export class DocumentTypeDto {
  @IsNotEmpty()
  name: string;
}
