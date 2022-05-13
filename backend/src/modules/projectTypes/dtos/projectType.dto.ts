import { IsNotEmpty } from 'class-validator';

export class ProjectTypeDto {
  @IsNotEmpty()
  name: string;
}
