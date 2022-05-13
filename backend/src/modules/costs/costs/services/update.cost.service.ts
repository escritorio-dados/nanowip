import { Injectable } from '@nestjs/common';

import { FindOneDocumentTypeService } from '@modules/costs/documentTypes/services/findOne.documentType.service';
import { FindOneServiceProviderService } from '@modules/costs/serviceProviders/services/findOne.serviceProvider.service';

import { CostDto } from '../dtos/cost.dto';
import { CostsRepository } from '../repositories/costs.repository';
import { fixHoursCost } from '../utils/fixHoursCost';
import { getStatusCost } from '../utils/getStatusCost';
import { CommonCostService } from './common.cost.service';

type IUpdateCostService = CostDto & { organization_id: string; id: string };

@Injectable()
export class UpdateCostService {
  constructor(
    private costsRepository: CostsRepository,
    private commonCostService: CommonCostService,

    private findOneServiceProviderService: FindOneServiceProviderService,
    private findOneDocumentTypeService: FindOneDocumentTypeService,
  ) {}

  async execute({
    id,
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
  }: IUpdateCostService) {
    const cost = await this.commonCostService.getCost({ id, organization_id });

    cost.reason = reason;
    cost.value = value;
    cost.description = description || null;
    cost.dueDate = fixHoursCost(dueDate);
    cost.issueDate = fixHoursCost(issueDate);
    cost.paymentDate = fixHoursCost(paymentDate);
    cost.documentNumber = documentNumber || null;
    cost.documentLink = documentLink || null;

    // Alterando o tipo de documento
    if (cost.document_type_id !== document_type_id) {
      if (!document_type_id) {
        cost.document_type_id = null;
      } else {
        cost.documentType = await this.findOneDocumentTypeService.execute({
          id: document_type_id,
          organization_id,
        });

        cost.document_type_id = document_type_id;
      }
    }

    // Alterando o prestador de serviço
    if (cost.service_provider_id !== service_provider_id) {
      if (!service_provider_id) {
        cost.service_provider_id = null;
      } else {
        cost.serviceProvider = await this.findOneServiceProviderService.execute({
          id: service_provider_id,
          organization_id,
        });

        cost.service_provider_id = service_provider_id;
      }
    }

    // Salvando alterações
    await this.costsRepository.save(cost);

    return { ...cost, status: getStatusCost(cost) };
  }
}
