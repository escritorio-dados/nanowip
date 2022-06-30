import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { OperationalObjective } from '@modules/objectives/operacionalObjectives/entities/OperationalObjective';

@Entity('integrated_objectives')
export class IntegratedObjective {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  organization_id: string;

  @OneToMany(
    () => OperationalObjective,
    operationalObjective => operationalObjective.integratedObjective,
  )
  operationalObjectives?: OperationalObjective[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
