/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import { IsArray, IsPositive, IsUUID, ValidateNested } from 'class-validator';

class NewPosition {
  @IsUUID()
  id: string;

  @IsPositive()
  position: number;
}

export class UpdatePositionsDeliverableDto {
  @IsUUID()
  objective_section_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewPosition)
  newPositions: NewPosition[];
}
