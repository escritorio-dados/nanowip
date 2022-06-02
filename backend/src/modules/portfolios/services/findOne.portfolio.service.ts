import { Injectable } from '@nestjs/common';

import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { CommonPortfolioService } from './common.portfolio.service';

type IFindOnePortfolioService = { id: string; organization_id: string };

@Injectable()
export class FindOnePortfolioService {
  constructor(
    private commonPortfolioService: CommonPortfolioService,
    private portfoliosRepository: PortfoliosRepository,
  ) {}

  async findWithProjects({ id, organization_id }: IFindOnePortfolioService) {
    const portfolio = await this.portfoliosRepository.findByIdWithProjects(id);

    this.commonPortfolioService.validatePortfolio({ portfolio, organization_id });

    return portfolio;
  }
}
