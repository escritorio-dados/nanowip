import { Injectable } from '@nestjs/common';

import { CommonProductTypeService } from './common.productType.service';

type IFindOneProductTypeService = { id: string; organization_id: string };

@Injectable()
export class FindOneProductTypeService {
  constructor(private commonProductTypeService: CommonProductTypeService) {}

  async execute({ id, organization_id }: IFindOneProductTypeService) {
    return this.commonProductTypeService.getProductType({ id, organization_id });
  }
}
