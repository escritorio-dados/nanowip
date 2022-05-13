import { IsNotEmpty } from 'class-validator';

export class ServiceProviderDto {
  @IsNotEmpty()
  name: string;
}
