/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import { IsArray, IsPositive, IsUUID, ValidateNested } from 'class-validator';

class NewPositionCategory {
  @IsUUID()
  id: string;

  @IsPositive()
  position: number;
}

export class UpdatePositionsTrailSectionDto {
  @IsUUID()
  section_trail_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NewPositionCategory)
  newPositions: NewPositionCategory[];
}
