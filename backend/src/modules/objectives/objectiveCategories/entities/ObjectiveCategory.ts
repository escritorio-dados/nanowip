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

import { ObjectiveSection } from '@modules/objectives/objectiveSections/entities/ObjectiveSection';
import { OperationalObjective } from '@modules/objectives/operacionalObjectives/entities/OperationalObjective';

export type IObjectiveCategoryType = 'manual' | 'tags';
export const ObjectiveCategoryTypes = { manual: 'manual', tags: 'tags' };

@Entity('objective_categories')
export class ObjectiveCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: IObjectiveCategoryType;

  @Column('int')
  position: number;

  @Column('uuid')
  organization_id: string;

  @Column('uuid')
  operational_objective_id: string;

  @ManyToOne(() => OperationalObjective)
  @JoinColumn({ name: 'operational_objective_id' })
  operationalObjective?: OperationalObjective;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @OneToMany(
    () => ObjectiveSection,
    objectiveSection => objectiveSection.objectiveCategory,
  )
  objectiveSections: ObjectiveSection[];
}
