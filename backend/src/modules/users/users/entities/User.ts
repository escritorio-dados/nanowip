import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Collaborator } from '@modules/collaborators/collaborators/entities/Collaborator';
import { Organization } from '@modules/organizations/entities/Organization';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column('uuid')
  organization_id: string;

  @Column({ type: 'varchar', array: true })
  permissions: string[];

  @OneToOne(
    () => Collaborator,
    collaborator => collaborator.user,
  )
  collaborator?: Collaborator;

  @ManyToOne(() => Organization, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
