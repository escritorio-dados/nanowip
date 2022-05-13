import { Injectable } from '@nestjs/common';

import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { CommonPortfolioService } from './common.portfolio.service';

type IDeletePortfolioService = { id: string; organization_id: string };

@Injectable()
export class DeletePortfolioService {
  constructor(
    private portfoliosRepository: PortfoliosRepository,
    private commonPortfolioService: CommonPortfolioService,
  ) {}

  async execute({ id, organization_id }: IDeletePortfolioService) {
    const portfolio = await this.commonPortfolioService.getPortfolio({ id, organization_id });

    await this.portfoliosRepository.delete(portfolio);
  }
}
