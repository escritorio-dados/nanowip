import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { IntegratedObjective } from '@modules/objectives/integratedObjectives/entities/IntegratedObjective';
import { ObjectiveCategory } from '@modules/objectives/objectiveCategories/entities/ObjectiveCategory';

@Entity('operational_objectives')
export class OperationalObjective {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  organization_id: string;

  @Column('uuid')
  integrated_objective_id: string;

  @ManyToOne(() => IntegratedObjective)
  @JoinColumn({ name: 'integrated_objective_id' })
  integratedObjective?: IntegratedObjective;

  @Column('timestamp with time zone')
  deadline?: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @OneToMany(
    () => ObjectiveCategory,
    operationalObjective => operationalObjective.operationalObjective,
  )
  objectiveCategories: ObjectiveCategory[];
}
