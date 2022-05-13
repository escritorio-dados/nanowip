import { IsUUID } from 'class-validator';

export class IParamId {
  @IsUUID()
  id: string;
}
