import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { Assignment } from '@modules/assignments/entities/Assignment';
import { CollaboratorStatus } from '@modules/colaboratorsStatus/entities/CollaboratorStatus';
import { Tracker } from '@modules/trackers/entities/Tracker';
import { User } from '@modules/users/entities/User';

@Entity('collaborators')
export class Collaborator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'job_title' })
  jobTitle: string;

  @Column({ type: 'boolean' })
  type: 'Interno' | 'Externo';

  @Column('uuid')
  user_id?: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @OneToMany(
    () => CollaboratorStatus,
    collaboratorStatus => collaboratorStatus.collaborator,
  )
  collaboratorStatus: CollaboratorStatus[];

  @OneToMany(
    () => Assignment,
    assigment => assigment.collaborator,
  )
  assignments: Assignment[];

  @OneToMany(
    () => Tracker,
    tracker => tracker.assignment,
  )
  trackers: Tracker[];

  @Column('uuid')
  organization_id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
