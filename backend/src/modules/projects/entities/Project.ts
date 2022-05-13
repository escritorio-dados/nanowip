import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';

import { IStatusDate } from '@shared/enums/statusDate.enum';

import { Customer } from '@modules/customers/entities/Customer';
import { Portfolio } from '@modules/portfolios/entities/Portfolio';
import { Product } from '@modules/products/entities/Product';
import { ProjectType } from '@modules/projectTypes/entities/ProjectType';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('timestamp with time zone')
  deadline?: Date;

  // Status em relação as datas
  statusDate?: IStatusDate;

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate?: Date;

  @Column({ name: 'available_date', type: 'timestamp with time zone' })
  availableDate?: Date;

  // Cliente
  @Column('uuid')
  customer_id?: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  // Projeto Pai
  @Column('uuid')
  project_parent_id?: string;

  @ManyToOne(() => Project, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'project_parent_id' })
  projectParent?: Project;

  // Tipo de Projeto
  @Column('uuid')
  project_type_id: string;

  @ManyToOne(() => ProjectType, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'project_type_id' })
  projectType?: ProjectType;

  @Column('uuid')
  organization_id: string;

  // Colunas de auditoria (criação e atualização)
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Portfolios
  @ManyToMany(
    () => Portfolio,
    portfolio => portfolio.projects,
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' },
  )
  portfolios: Portfolio[];

  // Relação do que está abaixo (A entidade fraca)
  @OneToMany(
    () => Product,
    product => product.project,
  )
  products: Product[];

  @OneToMany(
    () => Project,
    project => project.projectParent,
  )
  subprojects: Project[];
}
