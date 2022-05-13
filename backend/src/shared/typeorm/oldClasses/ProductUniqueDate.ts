import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class OldProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Unidades de Medida
  @Column('float')
  quantity: number;

  @Column('uuid')
  measure_id: string;

  // Prazo
  @Column('timestamp with time zone')
  deadline?: Date;

  // Data de Incio
  @Column({ name: 'start_date_fixed', type: 'timestamp with time zone' })
  startDateFixed?: Date;

  @Column({ name: 'start_date_calc', type: 'timestamp with time zone' })
  startDateCalc?: Date;

  // Data de término
  @Column({ name: 'end_date_fixed', type: 'timestamp with time zone' })
  endDateFixed?: Date | null;

  @Column({ name: 'end_date_calc', type: 'timestamp with time zone' })
  endDateCalc?: Date | null;

  // Datas de Disponibilidade
  @Column({ name: 'available_date_fixed', type: 'timestamp with time zone' })
  availableDateFixed?: Date;

  @Column({ name: 'available_date_calc', type: 'timestamp with time zone' })
  availableDateCalc?: Date;

  // Projeto
  @Column('uuid')
  project_id?: string;

  // Produto Pai
  @Column('uuid')
  product_parent_id?: string;

  // Tipo de produto
  @Column('uuid')
  product_type_id: string;

  @Column('uuid')
  organization_id: string;

  // Colunas de auditoria (criação e atualização)
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
