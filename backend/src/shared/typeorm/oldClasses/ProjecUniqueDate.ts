import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('projects')
export class OldProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('timestamp with time zone')
  deadline?: Date;

  // Datas de Inicio
  @Column({ name: 'start_date_fixed', type: 'timestamp with time zone' })
  startDateFixed?: Date;

  @Column({ name: 'start_date_calc', type: 'timestamp with time zone' })
  startDateCalc?: Date;

  // Datas de Fim

  @Column({ name: 'end_date_fixed', type: 'timestamp with time zone' })
  endDateFixed?: Date | null;

  @Column({ name: 'end_date_calc', type: 'timestamp with time zone' })
  endDateCalc?: Date | null;

  // Datas de Disponibilidade
  @Column({ name: 'available_date_fixed', type: 'timestamp with time zone' })
  availableDateFixed?: Date;

  @Column({ name: 'available_date_calc', type: 'timestamp with time zone' })
  availableDateCalc?: Date;

  // Cliente
  @Column('uuid')
  customer_id?: string;

  // Projeto Pai
  @Column('uuid')
  project_parent_id?: string;

  @ManyToOne(() => OldProject, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'project_parent_id' })
  projectParent?: OldProject;

  // Tipo de Projeto
  @Column('uuid')
  project_type_id: string;

  @Column('uuid')
  organization_id: string;

  // Colunas de auditoria (criação e atualização)
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
