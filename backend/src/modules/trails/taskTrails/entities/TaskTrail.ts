import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { TaskType } from '@modules/tasks/taskTypes/entities/TaskType';
import { Trail } from '@modules/trails/trails/entities/Trail';

@Entity('task_trails')
export class TaskTrail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  task_type_id: string;

  @Column('uuid')
  trail_id: string;

  @Column('uuid')
  organization_id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @ManyToOne(() => Trail)
  @JoinColumn({ name: 'trail_id' })
  trail: Trail;

  @ManyToOne(() => TaskType)
  @JoinColumn({ name: 'task_type_id' })
  taskType: TaskType;

  // Dependencias
  @ManyToMany(
    () => TaskTrail,
    task => task.nextTasks,
  )
  @JoinTable({
    name: 'task_trails_dependencies',
    joinColumn: { name: 'task_id' },
    inverseJoinColumn: { name: 'previous_task_id' },
  })
  previousTasks: TaskTrail[];

  @ManyToMany(
    () => TaskTrail,
    task => task.previousTasks,
  )
  nextTasks: TaskTrail[];
}
