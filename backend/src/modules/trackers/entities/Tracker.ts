import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';

import { Assignment } from '@modules/assignments/entities/Assignment';
import { Collaborator } from '@modules/collaborators/collaborators/entities/Collaborator';

@Entity('trackers')
export class Tracker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  collaborator_id: string;

  @Column('uuid')
  assignment_id?: string;

  @Column({ type: 'timestamp with time zone' })
  start: Date;

  @Column({ type: 'timestamp with time zone' })
  end?: Date;

  @Column()
  reason?: string;

  @OneToOne(() => Collaborator)
  @JoinColumn({ name: 'collaborator_id' })
  collaborator: Collaborator;

  @OneToOne(() => Assignment)
  @JoinColumn({ name: 'assignment_id' })
  assignment?: Assignment;

  @Column('uuid')
  organization_id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
