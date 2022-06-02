import { IsNotEmpty, IsUUID, IsOptional, IsArray } from 'class-validator';

export class CreateTaskTrailDto {
  @IsNotEmpty()
  name: string;

  @IsUUID()
  task_type_id: string;

  @IsUUID()
  trail_id: string;

  @IsOptional()
  @IsUUID(undefined, { each: true })
  @IsArray()
  previous_tasks_ids?: string[] = [];

  @IsOptional()
  @IsUUID(undefined, { each: true })
  @IsArray()
  next_tasks_ids?: string[] = [];
}
