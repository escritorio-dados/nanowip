import { IsNotEmpty, IsUUID, ValidateIf } from 'class-validator';

export class StartTrackerDto {
  @ValidateIf(data => !data.reason)
  @IsUUID()
  assignment_id?: string;

  @ValidateIf(data => !data.assignment_id)
  @IsNotEmpty()
  reason?: string;
}
