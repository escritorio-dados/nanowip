import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { ObjectiveSection } from '@modules/objectives/objectiveSections/entities/ObjectiveSection';
import { ValueChain } from '@modules/valueChains/entities/ValueChain';

@Entity('deliverables')
export class Deliverable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('timestamp with time zone')
  deadline: Date;

  @Column('int')
  position: number;

  @Column('int')
  progress: number;

  @Column('int')
  goal: number;

  @Column()
  description: string;

  @Column('uuid')
  organization_id: string;

  @Column('uuid')
  objective_section_id: string;

  @ManyToOne(() => ObjectiveSection)
  @JoinColumn({ name: 'objective_section_id' })
  objectiveSection?: ObjectiveSection;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @ManyToMany(() => ValueChain)
  @JoinTable({
    name: 'deliverables_value_chains',
    joinColumn: { name: 'deliverable_id' },
    inverseJoinColumn: { name: 'value_chain_id' },
  })
  valueChains: ValueChain[];
}
