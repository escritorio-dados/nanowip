import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { TagsGroup } from '@modules/tags/tagsGroups/entities/TagsGroup';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('uuid')
  organization_id: string;

  @Column('uuid')
  tags_group_id: string;

  @ManyToOne(() => TagsGroup)
  @JoinColumn({ name: 'tags_group_id' })
  tagsGroup?: TagsGroup;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
