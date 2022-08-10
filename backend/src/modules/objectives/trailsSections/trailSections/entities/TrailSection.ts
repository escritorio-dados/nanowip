import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

import { TagsGroup } from '@modules/tags/tagsGroups/entities/TagsGroup';

import { SectionTrail } from '../../sectionTrails/entities/SectionTrail';

@Entity('trail_sections')
export class TrailSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('int')
  position: number;

  @Column('uuid')
  organization_id: string;

  @Column('uuid')
  section_trail_id: string;

  @ManyToOne(() => SectionTrail)
  @JoinColumn({ name: 'section_trail_id' })
  sectionTrail?: SectionTrail;

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
}
