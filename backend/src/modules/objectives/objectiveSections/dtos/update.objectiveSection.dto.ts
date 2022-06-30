import { IsNotEmpty } from 'class-validator';

export class UpdateObjectiveSectionDto {
  @IsNotEmpty()
  name: string;
}
