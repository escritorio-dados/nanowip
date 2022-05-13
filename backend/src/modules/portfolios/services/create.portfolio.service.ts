import { Injectable } from '@nestjs/common';

import { PortfolioDto } from '../dtos/portfolio.dto';
import { Portfolio } from '../entities/Portfolio';
import { PortfoliosRepository } from '../repositories/portfolios.repository';
import { CommonPortfolioService } from './common.portfolio.service';

type ICreatePortfolioService = PortfolioDto & { organization_id: string };

@Injectable()
export class CreatePortfolioService {
  constructor(
    private portfoliosRepository: PortfoliosRepository,
    private commonPortfolioService: CommonPortfolioService,
  ) {}

  async execute({ name, organization_id }: ICreatePortfolioService): Promise<Portfolio> {
    await this.commonPortfolioService.validadeName({ name, organization_id });

    const portfolio = await this.portfoliosRepository.create({
      name: name.trim(),
      organization_id,
    });

    return portfolio;
  }
}
