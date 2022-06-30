import { IsNotEmpty } from 'class-validator';

export class IntegratedObjectiveDto {
  @IsNotEmpty()
  name: string;
}
