import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTaskReportCommentDto {
  @IsNotEmpty()
  reportName: string;

  @IsUUID()
  task_id: string;

  @IsNotEmpty()
  comment: string;
}
