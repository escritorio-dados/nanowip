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
import { Service } from '@modules/costs/services/entities/Service';
import { Product } from '@modules/products/entities/Product';

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
  service_id?: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service?: Service;

  // Colunas Padrão
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @Column('uuid')
  organization_id: string;
}
