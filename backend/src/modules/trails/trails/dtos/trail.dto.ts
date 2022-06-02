import { IsNotEmpty } from 'class-validator';

export class TrailDto {
  @IsNotEmpty()
  name: string;
}
