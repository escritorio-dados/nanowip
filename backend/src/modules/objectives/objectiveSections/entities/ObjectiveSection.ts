import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { Deliverable } from '@modules/objectives/deliverables/entities/Deliverable';
import { ObjectiveCategory } from '@modules/objectives/objectiveCategories/entities/ObjectiveCategory';
import { TagsGroup } from '@modules/tags/tagsGroups/entities/TagsGroup';

@Entity('objective_sections')
export class ObjectiveSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('int')
  position: number;

  @Column('uuid')
  organization_id: string;

  @Column('uuid')
  objective_category_id: string;

  @ManyToOne(() => ObjectiveCategory)
  @JoinColumn({ name: 'objective_category_id' })
  objectiveCategory?: ObjectiveCategory;

  // Tags
  @Column('uuid')
  tags_group_id: string;

  @OneToOne(() => TagsGroup)
  @JoinColumn({ name: 'tags_group_id' })
  tagsGroup: TagsGroup;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @OneToMany(
    () => Deliverable,
    deliverable => deliverable.objectiveSection,
  )
  deliverables: Deliverable[];
}
