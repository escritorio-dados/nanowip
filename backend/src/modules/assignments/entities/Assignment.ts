import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Collaborator } from '@modules/collaborators/entities/Collaborator';
import { Task } from '@modules/tasks/entities/Task';
import { Tracker } from '@modules/trackers/entities/Tracker';

import { StatusAssignment } from '../enums/status.assignment.enum';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  status: StatusAssignment;

  @Column({ type: 'int', name: 'time_limit' })
  timeLimit?: number;

  // Tarefa
  @Column('uuid')
  task_id: string;

  @ManyToOne(() => Task)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  // Colaborador
  @Column('uuid')
  collaborator_id: string;

  @ManyToOne(() => Collaborator)
  @JoinColumn({ name: 'collaborator_id' })
  collaborator: Collaborator;

  // Datas Calculadas
  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate?: Date | null;

  // Outros Relacionamentos
  @OneToMany(
    () => Tracker,
    tracker => tracker.assignment,
  )
  trackers: Tracker[];

  @Column('uuid')
  organization_id: string;

  // Datas de Auditoria
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
