import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { CostDistribution } from '@modules/costs/costDistribuitions/entities/CostDistribution';
import { Task } from '@modules/tasks/tasks/entities/Task';
import { TaskTrail } from '@modules/trails/taskTrails/entities/TaskTrail';

@Entity('task_types')
export class TaskType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(
    () => Task,
    task => task.taskType,
  )
  tasks: Task[];

  @OneToMany(
    () => TaskTrail,
    task => task.taskType,
  )
  taskTrails: TaskTrail[];

  @OneToMany(
    () => CostDistribution,
    cost => cost.taskType,
  )
  costs: CostDistribution[];

  @Column('uuid')
  organization_id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
