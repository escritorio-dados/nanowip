import { Injectable } from '@nestjs/common';

import { PortfolioDto } from '../dtos/portfolio.dto';
import { Portfolio } from '../entities/Portfolio';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { CommonPortfolioService } from './common.portfolio.service';

type IUpdatePortfolio = PortfolioDto & { id: string; organization_id: string };

@Injectable()
export class UpdatePortfolioService {
  constructor(
    private portfoliosRepository: PortfoliosRepository,
    private commonPortfolioService: CommonPortfolioService,
  ) {}

  async execute({ id, name, organization_id }: IUpdatePortfolio): Promise<Portfolio> {
    const portfolio = await this.commonPortfolioService.getPortfolio({ id, organization_id });

    if (portfolio.name.toLowerCase() !== name.trim().toLowerCase()) {
      await this.commonPortfolioService.validadeName({ name, organization_id });
    }

    portfolio.name = name.trim();

    await this.portfoliosRepository.save(portfolio);

    return portfolio;
  }
}
