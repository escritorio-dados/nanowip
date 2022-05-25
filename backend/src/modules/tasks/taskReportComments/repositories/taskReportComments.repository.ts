import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from '@modules/tasks/tasks/entities/Task';

import { TaskReportComment } from '../entities/TaskReportComment';

type IFindAll = { organization_id: string };
type IFindAllByTaskReport = { reportName: string; task_id: string; organization_id: string };
type ICreate = { comment: string; reportName: string; task: Task; organization_id: string };

@Injectable()
export class TaskReportCommentsRepository {
  constructor(
    @InjectRepository(TaskReportComment)
    private repository: Repository<TaskReportComment>,
  ) {}

  async findById(id: string, relations?: string[]) {
    return this.repository.findOne(id, { relations });
  }

  async findAll({ organization_id }: IFindAll) {
    return this.repository.find({ where: { organization_id }, order: { created_at: 'ASC' } });
  }

  async findAllByTaskReport({ organization_id, reportName, task_id }: IFindAllByTaskReport) {
    return this.repository.find({
      where: { organization_id, reportName, task_id },
      order: { created_at: 'ASC' },
    });
  }

  async create(data: ICreate) {
    const taskReportComment = this.repository.create(data);

    await this.repository.save(taskReportComment);

    return taskReportComment;
  }

  async delete(taskReportComment: TaskReportComment) {
    await this.repository.remove(taskReportComment);
  }

  async save(taskReportComment: TaskReportComment) {
    return this.repository.save(taskReportComment);
  }
}
