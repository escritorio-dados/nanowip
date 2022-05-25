import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { Task } from '@modules/tasks/tasks/entities/Task';

@Entity('task_report_comments')
export class TaskReportComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'report_name', type: 'varchar' })
  reportName: string;

  @Column('varchar')
  comment: string;

  @Column('uuid')
  task_id: string;

  @ManyToOne(() => Task)
  @JoinColumn({ name: 'task_id' })
  task?: Task;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @Column('uuid')
  organization_id: string;
}
