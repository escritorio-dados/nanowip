import { IsNotEmpty } from 'class-validator';

export class UpdateTaskReportCommentDto {
  @IsNotEmpty()
  comment: string;
}
