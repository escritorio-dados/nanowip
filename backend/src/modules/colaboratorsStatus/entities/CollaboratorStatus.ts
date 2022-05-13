import { Transform } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { NumericTransformer } from '@shared/utils/numericTransformer';

import { Collaborator } from '@modules/collaborators/entities/Collaborator';

@Entity('collaborator_status')
export class CollaboratorStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('numeric', { transformer: new NumericTransformer() })
  @Transform(() => Number)
  salary: number;

  @Column({ name: 'month_hours', type: 'float' })
  monthHours: number;

  @Column('timestamp with time zone')
  date: Date;

  @Column('uuid')
  collaborator_id: string;

  @ManyToOne(() => Collaborator)
  @JoinColumn({ name: 'collaborator_id' })
  collaborator: Collaborator;

  @Column('uuid')
  organization_id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
