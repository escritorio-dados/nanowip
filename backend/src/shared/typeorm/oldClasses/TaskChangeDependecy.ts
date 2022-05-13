import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tasks')
export class TaskChangeDependency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('int')
  position: number;

  // Prazo
  @Column('timestamp with time zone')
  deadline?: Date;

  // Data de inicio
  @Column({ name: 'start_date_fixed', type: 'timestamp with time zone' })
  startDateFixed?: Date;

  @Column({ name: 'start_date_calc', type: 'timestamp with time zone' })
  startDateCalc?: Date;

  // Data de término
  @Column({ name: 'end_date_fixed', type: 'timestamp with time zone' })
  endDateFixed?: Date | null;

  @Column({ name: 'end_date_calc', type: 'timestamp with time zone' })
  endDateCalc?: Date | null;

  // Data de disponibilidade
  @Column({ name: 'available_date', type: 'timestamp with time zone' })
  availableDate?: Date;

  // Tipo de tarefa
  @Column('uuid')
  task_type_id: string;

  // Cadeia de valor
  @Column('uuid')
  value_chain_id: string;

  // Tarefa Anterior
  @Column('uuid')
  task_before_id?: string;

  // Outros Relacionamentos
  @Column('uuid')
  organization_id: string;

  // Colunas de auditoria
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
