import { IsUUID } from 'class-validator';

export class FindByTrailTrailSectionQuery {
  @IsUUID()
  section_trail_id: string;
}
