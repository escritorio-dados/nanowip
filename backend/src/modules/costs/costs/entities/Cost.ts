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

import { CostDistribution } from '@modules/costs/costDistribuitions/entities/CostDistribution';
import { DocumentTypeCost } from '@modules/costs/documentTypes/entities/DocumentType';
import { ServiceProvider } from '@modules/costs/serviceProviders/entities/ServiceProvider';

@Entity('costs')
export class Cost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reason: string;

  @Column()
  description?: string;

  @Column('numeric')
  value: number;

  /** Data de Emissão */
  @Column({ name: 'issue_date', type: 'timestamp with time zone' })
  issueDate?: Date;

  /** Data de Vencimento */
  @Column({ name: 'due_date', type: 'timestamp with time zone' })
  dueDate?: Date;

  /** Data de Pagamento */
  @Column({ name: 'payment_date', type: 'timestamp with time zone' })
  paymentDate?: Date;

  // Tipo e numero do documento
  @Column('uuid')
  document_type_id?: string;

  @ManyToOne(() => DocumentTypeCost)
  @JoinColumn({ name: 'document_type_id' })
  documentType?: DocumentTypeCost;

  @Column({ name: 'document_number' })
  documentNumber?: string;

  @Column({ name: 'document_link' })
  documentLink?: string;

  // Prestador de Serviço
  @Column('uuid')
  service_provider_id?: string;

  @ManyToOne(() => ServiceProvider)
  @JoinColumn({ name: 'service_provider_id' })
  serviceProvider?: ServiceProvider;

  // Distribuições do Custo
  @OneToMany(
    () => CostDistribution,
    costDistribution => costDistribution.cost,
  )
  costsDistributions: CostDistribution[];

  // Colunas padrão
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  @Column('uuid')
  organization_id: string;

  @Column({ name: 'percent_distributed', type: 'float' })
  percentDistributed: number;
}
