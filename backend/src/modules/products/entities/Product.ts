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

import { IStatusDate } from '@shared/enums/statusDate.enum';

import { Measure } from '@modules/measures/entities/Measure';
import { ProductType } from '@modules/productTypes/entities/ProductType';
import { Project } from '@modules/projects/entities/Project';
import { ValueChain } from '@modules/valueChains/entities/ValueChain';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Unidades de Medida
  @Column('float')
  quantity: number;

  @Column('uuid')
  measure_id: string;

  @ManyToOne(() => Measure, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'measure_id' })
  measure: Measure;

  // Prazo
  @Column('timestamp with time zone')
  deadline?: Date;

  // Status em relação as datas
  statusDate?: IStatusDate;

  // Data de Incio
  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate?: Date;

  // Data de término
  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate?: Date | null;

  // Datas de Disponibilidade
  @Column({ name: 'available_date', type: 'timestamp with time zone' })
  availableDate?: Date;

  // Projeto
  @Column('uuid')
  project_id?: string;

  @ManyToOne(() => Project, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  // Produto Pai
  @Column('uuid')
  product_parent_id?: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'product_parent_id' })
  productParent: Product;

  // Tipo de produto
  @Column('uuid')
  product_type_id: string;

  @ManyToOne(() => ProductType, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'product_type_id' })
  productType: ProductType;

  @Column('uuid')
  organization_id: string;

  // Colunas de auditoria (criação e atualização)
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Outros Relacionamentos
  @OneToMany(
    () => Product,
    product => product.productParent,
  )
  subproducts: Product[];

  @OneToMany(
    () => ValueChain,
    valueChain => valueChain.product,
  )
  valueChains: ValueChain[];
}
