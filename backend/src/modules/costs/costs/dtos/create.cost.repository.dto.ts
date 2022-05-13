import { DocumentTypeCost } from '@modules/costs/documentTypes/entities/DocumentType';
import { ServiceProvider } from '@modules/costs/serviceProviders/entities/ServiceProvider';

export type ICreateCostRepositoryDto = {
  reason: string;
  value: number;
  description?: string;
  issueDate?: Date;
  dueDate?: Date;
  paymentDate?: Date;
  documentType?: DocumentTypeCost;
  documentNumber?: string;
  serviceProvider?: ServiceProvider;
  organization_id: string;
};
