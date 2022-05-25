import { IsNotEmpty } from 'class-validator';

export class TaskTypeDto {
  @IsNotEmpty()
  name: string;
}
