import { IsNotEmpty } from 'class-validator';

export class ServiceDto {
  @IsNotEmpty()
  name: string;
}
