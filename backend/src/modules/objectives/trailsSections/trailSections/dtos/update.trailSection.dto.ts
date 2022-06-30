import { IsNotEmpty } from 'class-validator';

export class UpdateTrailSectionDto {
  @IsNotEmpty()
  name: string;
}
