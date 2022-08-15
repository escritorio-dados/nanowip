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
  OneToOne,
} from 'typeorm';

import { MilestonesGroup } from '@modules/milestones/milestonesGroups/entities/MilestonesGroup';
import { ObjectiveCategory } from '@modules/objectives/objectiveCategories/entities/ObjectiveCategory';
import { ValueChain } from '@modules/valueChains/entities/ValueChain';

@Entity('deliverable_tags')
export class DeliverableTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('timestamp with time zone')
  deadline: Date;

  @Column('int')
  progress: number;

  @Column('int')
  goal: number;

  @Column()
  description: string;

  @Column('uuid')
  organization_id: string;

  @Column('uuid')
  objective_category_id: string;

  @ManyToOne(() => ObjectiveCategory)
  @JoinColumn({ name: 'objective_category_id' })
  objectiveCategory?: ObjectiveCategory;

  // Milestones
  @Column('uuid')
  milestones_group_id: string;

  @OneToOne(() => MilestonesGroup)
  @JoinColumn({ name: 'milestones_group_id' })
  milestonesGroup: MilestonesGroup;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @ManyToMany(() => ValueChain)
  @JoinTable({
    name: 'deliverable_tags_value_chains',
    joinColumn: { name: 'deliverable_tag_id' },
    inverseJoinColumn: { name: 'value_chain_id' },
  })
  valueChains: ValueChain[];
}
