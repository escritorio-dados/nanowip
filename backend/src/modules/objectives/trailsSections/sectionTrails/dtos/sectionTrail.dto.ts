import { IsNotEmpty } from 'class-validator';

export class SectionTrailDto {
  @IsNotEmpty()
  name: string;
}
