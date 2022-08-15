import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { MilestonesGroup } from '@modules/milestones/milestonesGroups/entities/MilestonesGroup';

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('timestamp with time zone')
  date: Date;

  @Column('varchar')
  description: string;

  @Column('uuid')
  organization_id: string;

  @Column('uuid')
  milestones_group_id: string;

  @ManyToOne(() => MilestonesGroup)
  @JoinColumn({ name: 'milestones_group_id' })
  milestonesGroup?: MilestonesGroup;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
