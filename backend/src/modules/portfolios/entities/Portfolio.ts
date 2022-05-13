import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Project } from '@modules/projects/entities/Project';

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  organization_id: string;

  @ManyToMany(
    () => Project,
    project => project.portfolios,
  )
  @JoinTable({
    name: 'portfolios_projects',
    joinColumn: { name: 'portfolio_id' },
    inverseJoinColumn: { name: 'project_id' },
  })
  projects: Project[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
