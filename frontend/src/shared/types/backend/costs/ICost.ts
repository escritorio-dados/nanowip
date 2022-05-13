import { getSortOptions } from '#shared/utils/pagination';

import { ICommonApi } from '../shared/ICommonApi';
import { IDocumentType } from './IDocumentType';
import { IServiceProvider } from './IServiceProvider';

export type ICost = ICommonApi & {
  paymentDate?: Date;
  dueDate?: Date;
  issueDate?: Date;
  value: number;
  reason: string;
  description?: string;
  status: string;
  documentType?: IDocumentType;
  serviceProvider?: IServiceProvider;
  documentNumber?: string;
  documentLink?: string;
  percentDistributed?: number;
};

export type ICostInput = {
  paymentDate?: Date;
  dueDate?: Date;
  issueDate?: Date;
  value: number;
  reason: string;
  description?: string;
  document_type_id?: string;
  service_provider_id?: string;
  documentNumber?: string;
  documentLink?: string;
};

export type ICostFilter = {
  reason: string;
  description: string;
  documentNumber: string;
  documentType: { id: string; name: string } | null;
  serviceProvider: { id: string; name: string } | null;
  status: { label: string; value: string } | null;
  min_value: string;
  max_value: string;
  min_due: Date | null;
  max_due: Date | null;
  min_issue: Date | null;
  max_issue: Date | null;
  min_payment: Date | null;
  max_payment: Date | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export type ICostDistributionFilter = {
  reason: string;
  description: string;
  documentNumber: string;
  documentType: { id: string; name: string } | null;
  product: { id: string; pathString: string } | null;
  service: { id: string; name: string } | null;
  serviceProvider: { id: string; name: string } | null;
  status: { label: string; value: string } | null;
  min_value: string;
  max_value: string;
  min_percent: string;
  max_percent: string;
  min_due: Date | null;
  max_due: Date | null;
  min_issue: Date | null;
  max_issue: Date | null;
  min_payment: Date | null;
  max_payment: Date | null;
  min_updated: Date | null;
  max_updated: Date | null;
};

export const StatusCost = {
  created: 'Criado',
  issued: 'Lançado',
  almostLate: 'Proximo do vencimento',
  late: 'Atrasado',
  paid: 'Pago',
};

export const statusCostOptions = getSortOptions(StatusCost);
