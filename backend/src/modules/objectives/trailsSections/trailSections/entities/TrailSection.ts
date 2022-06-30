import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

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

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
