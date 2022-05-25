import { IsNotEmpty } from 'class-validator';

export class FindAllByTaskReportLimitedTaskReportCommentQuery {
  @IsNotEmpty()
  report_name: string;

  @IsNotEmpty()
  task_id: string;
}
