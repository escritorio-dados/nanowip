import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Cost } from '@modules/costs/costs/entities/Cost';
import { Product } from '@modules/products/products/entities/Product';
import { TaskType } from '@modules/tasks/taskTypes/entities/TaskType';

@Entity('cost_distributions')
export class CostDistribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float')
  percent: number;

  // Custo
  @Column('uuid')
  cost_id: string;

  @ManyToOne(() => Cost)
  @JoinColumn({ name: 'cost_id' })
  cost: Cost;

  // Produto
  @Column('uuid')
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Service
  @Column('uuid')
  task_type_id?: string;

  @ManyToOne(() => TaskType)
  @JoinColumn({ name: 'task_type_id' })
  taskType?: TaskType;

  // Colunas Padrão
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @Column('uuid')
  organization_id: string;
}
