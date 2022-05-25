import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  JoinTable,
  ManyToMany,
} from 'typeorm';

import { IStatusDate } from '@shared/enums/statusDate.enum';

import { Assignment } from '@modules/assignments/entities/Assignment';
import { TaskReportComment } from '@modules/tasks/taskReportComments/entities/TaskReportComment';
import { TaskType } from '@modules/tasks/taskTypes/entities/TaskType';
import { ValueChain } from '@modules/valueChains/entities/ValueChain';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description?: string;

  @Column()
  link?: string;

  // Prazo
  @Column('timestamp with time zone')
  deadline?: Date;

  // Data de inicio
  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate?: Date;

  // Data de término
  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate?: Date | null;

  // Data de disponibilidade
  @Column({ name: 'available_date', type: 'timestamp with time zone' })
  availableDate?: Date;

  // Tipo de tarefa
  @Column('uuid')
  task_type_id: string;

  @ManyToOne(() => TaskType)
  @JoinColumn({ name: 'task_type_id' })
  taskType: TaskType;

  // Cadeia de valor
  @Column('uuid')
  value_chain_id: string;

  @ManyToOne(() => ValueChain)
  @JoinColumn({ name: 'value_chain_id' })
  valueChain: ValueChain;

  // Dependencias
  @ManyToMany(
    () => Task,
    task => task.nextTasks,
  )
  @JoinTable({
    name: 'task_dependencies',
    joinColumn: { name: 'task_id' },
    inverseJoinColumn: { name: 'previous_task_id' },
  })
  previousTasks: Task[];

  @ManyToMany(
    () => Task,
    task => task.previousTasks,
  )
  nextTasks: Task[];

  // Outros
  @OneToMany(
    () => Assignment,
    assigment => assigment.task,
  )
  assignments: Assignment[];

  @OneToMany(
    () => TaskReportComment,
    taskReportComment => taskReportComment.task,
  )
  commentsReport: TaskReportComment[];

  @Column('uuid')
  organization_id: string;

  // Colunas de auditoria
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Campos Virtual
  statusDate?: IStatusDate;
}
