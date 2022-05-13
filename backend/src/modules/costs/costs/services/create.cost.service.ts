import { Injectable } from '@nestjs/common';

import { FindOneDocumentTypeService } from '@modules/costs/documentTypes/services/findOne.documentType.service';
import { FindOneServiceProviderService } from '@modules/costs/serviceProviders/services/findOne.serviceProvider.service';

import { CostDto } from '../dtos/cost.dto';
import { ICreateCostRepositoryDto } from '../dtos/create.cost.repository.dto';
import { CostsRepository } from '../repositories/costs.repository';
import { fixHoursCost } from '../utils/fixHoursCost';
import { getStatusCost } from '../utils/getStatusCost';

type ICreateCostService = CostDto & { organization_id: string };

@Injectable()
export class CreateCostService {
  constructor(
    private costsRepository: CostsRepository,

    private findOneServiceProviderService: FindOneServiceProviderService,
    private findOneDocumentTypeService: FindOneDocumentTypeService,
  ) {}

  async execute({
    reason,
    value,
    description,
    document_type_id,
    dueDate,
    issueDate,
    paymentDate,
    service_provider_id,
    organization_id,
    documentNumber,
    documentLink,
  }: ICreateCostService) {
    const newCost: ICreateCostRepositoryDto = {
      organization_id,
      reason: reason.trim(),
      value,
      description,
      dueDate: fixHoursCost(dueDate),
      issueDate: fixHoursCost(issueDate),
      paymentDate: fixHoursCost(paymentDate),
      documentNumber,
      documentLink,
    } as ICreateCostRepositoryDto;

    // Validando e atribuindo o tipo de documento
    if (document_type_id) {
      newCost.documentType = await this.findOneDocumentTypeService.execute({
        id: document_type_id,
        organization_id,
      });
    }

    // Validando e atribuindo o prestador de serviço
    if (service_provider_id) {
      newCost.serviceProvider = await this.findOneServiceProviderService.execute({
        id: service_provider_id,
        organization_id,
      });
    }

    // Salvando no Banco de dados
    const cost = await this.costsRepository.create(newCost);

    return { ...cost, status: getStatusCost(cost) };
  }
}
