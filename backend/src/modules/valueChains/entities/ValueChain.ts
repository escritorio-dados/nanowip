import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Product } from '@modules/products/products/entities/Product';
import { Task } from '@modules/tasks/tasks/entities/Task';

@Entity('value_chains')
export class ValueChain {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Produto
  @Column('uuid')
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(
    () => Task,
    task => task.valueChain,
  )
  tasks: Task[];

  @Column('uuid')
  organization_id: string;

  // Datas para auditoria
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Datas Calculadas (Banco de dados)
  @Column({ name: 'available_date', type: 'timestamp with time zone' })
  availableDate?: Date;

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate?: Date | null;
}
