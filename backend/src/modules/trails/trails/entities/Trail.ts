import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { TaskTrail } from '@modules/trails/taskTrails/entities/TaskTrail';

@Entity('trails')
export class Trail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  organization_id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @OneToMany(
    () => TaskTrail,
    task => task.trail,
  )
  tasks: TaskTrail[];
}
