import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Milestone } from '@modules/milestones/milestones/entities/Milestone';

@Entity('milestones_groups')
export class MilestonesGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  organization_id: string;

  @OneToMany(
    () => Milestone,
    milestone => milestone.milestonesGroup,
  )
  milestones?: Milestone[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
